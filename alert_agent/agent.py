#!/usr/bin/env python3

"""
dgms_alert_processor.py

A seamless workflow that combines three agents into one file:
1.  DGMS Watcher: Watches the DGMS 'Alert' page for new safety alert PDFs.
2.  Gemini Extractor: For each new PDF, it extracts structured data using the Gemini API.
3.  Supabase Uploader: Uploads the extracted JSON data to a Supabase 'incidents' table.

It polls the DGMS site, compares found PDFs against a 'known' list (safety_alerts.json),
and processes only the new ones.

Usage:
    python dgms_alert_processor.py                     # Run in live mode
    python dgms_alert_processor.py --dev-url <your_url> # Use a dev URL
    python dgms_alert_processor.py --once               # Run one time and exit
"""

# --- Imports (Combined from all 3 scripts) ---
import argparse
import json
import os
import time
from urllib.parse import urljoin, urlparse, unquote
import tempfile
import shutil
import sys
import pathlib
from time import sleep

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from google import genai
from google.genai import types
from supabase import create_client, Client

# --- Environment Loading ---
# Load .env file for API keys (GEMINI_API_KEYS, SUPABASE_URL, SUPABASE_KEY)
load_dotenv()

# --- Constants ---
DEFAULT_URL = "https://www.dgms.gov.in/UserView/index?mid=1362"
DEFAULT_JSON = "safety_alerts.json"
DEFAULT_INTERVAL = 5  # seconds (Poll once per minute)


# =============================================================================
# AGENT 1: DGMS Safety Alert Watcher
# =============================================================================

def fetch_html(url: str, timeout: int = 20) -> str:
    """Fetch HTML from a live URL."""
    print(f"Fetching HTML from: {url}")
    resp = requests.get(url, timeout=timeout, headers={"User-Agent": "alert-watcher/1.0"})
    resp.raise_for_status()
    return resp.text


def extract_pdf_names_and_urls(html: str, base_url: str = "") -> dict:
    """
    Parse HTML and find <a> tags under '#skipmaincontent' whose href ends with '.pdf'.
    
    Returns:
        dict: A dictionary mapping {pdf_basename: full_pdf_url}
    """
    soup = BeautifulSoup(html, "html.parser")
    anchors = soup.select("#skipmaincontent a[href$='.pdf'], #skipmaincontent a[href$='.PDF']")
    names_to_urls = {}
    
    for a in anchors:
        href = a.get("href", "").strip()
        if not href:
            continue
            
        # resolve relative URLs against base_url
        full_url = urljoin(base_url, href)
        
        # parse path portion to get basename
        parsed = urlparse(full_url)
        basename = os.path.basename(parsed.path)
        if not basename:
            continue
        
        # Decode URL-encoded characters (like %20)
        decoded_basename = unquote(basename)
        
        # strip trailing .pdf/.PDF and lower-case it
        if decoded_basename.lower().endswith(".pdf"):
            name = decoded_basename[:-4].lower()
            if name:
                # Use the full, resolved URL
                names_to_urls[name] = full_url
                
    return names_to_urls


def load_known(json_path: str) -> list:
    """Loads the list of known PDF basenames from the JSON file."""
    if not os.path.exists(json_path):
        return []
    with open(json_path, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
            if isinstance(data, list):
                return data
            return list(data)
        except Exception:
            return []


def save_known_atomic(list_data: list, json_path: str):
    """Atomically saves the list of known PDF basenames to the JSON file."""
    dirn = os.path.dirname(os.path.abspath(json_path)) or "."
    fd, tmp = tempfile.mkstemp(prefix="." + os.path.basename(json_path) + ".", dir=dirn)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            json.dump(list_data, f, indent=2, ensure_ascii=False)
        shutil.move(tmp, json_path)
    finally:
        if os.path.exists(tmp):
            try:
                os.remove(tmp)
            except Exception:
                pass


# =============================================================================
# AGENT 2: Gemini PDF Extractor
# =============================================================================

# --- Initialize Gemini Client ---
try:
    gemini_api_keys = os.getenv('GEMINI_API_KEYS').split(',')
    gemini_api_key_id = 0
    genai_client = genai.Client(
        api_key=gemini_api_keys[gemini_api_key_id]
    )
    print("Successfully initialized Gemini client.")
except Exception as e:
    print(f"Error initializing Gemini client: {e}", file=sys.stderr)
    print("Please ensure 'GEMINI_API_KEYS' is set correctly in your .env file.", file=sys.stderr)
    genai_client = None  # Set to None so the loop can check


# --- Gemini System Prompt and Schema Definition ---
system_prompt = (
    "Return a single JSON object that matches the schema exactly.\n"
    "For any field that is NOT explicitly mentioned in the document, return null (without quotes).\n"
    "Date format: DD-MM-YY. Time format: HH:MM.\n"
    "Do not add extra keys."
)

structured_output_schema_description = 'Schema for Structured Output of DGMS Safety Alerts.'
structured_output_schema = {
    'mine': "Name of the Mine",
    'owner': "Owner of the Mine",
    'district': "District of the Mine",
    'state': "State (location) of the Mine",
    'mineral': "Mineral of the Mine",
    'place': "Place of Accident",
    'date': "Date of Accident",
    'time': "Time of Accident",
    'casualties': "Number of People killed",
    'injured': "Number of People seriously injured",
    'cause': "Prime facie cause of the Accident",
    'best_practices': "Best Practices only if the text best practices is explicitly mentioned",
    'cause_label': "Analyze the cause and classify among 'Fire', 'Explosion', 'Roof Fall', 'Fall', 'Machinery', 'Transport', 'Electricity', 'Ground Movement', 'Eruption Of Water', 'Flying Pieces', 'Combustible Gas', 'Inundation'"
}

properties = {}
for key, desc in structured_output_schema.items():
    if key in ('casualties', 'injured'):
        properties[key] = types.Schema(
            type=types.Type.INTEGER,
            description=desc
        )
    else:
        properties[key] = types.Schema(
            type=types.Type.STRING,
            description=desc
        )

# --- Gemini Model Configuration ---
model_config = types.GenerateContentConfig(
    thinking_config=types.ThinkingConfig(
        thinking_budget=0
    ),
    response_mime_type='application/json',
    response_schema=types.Schema(
        type=types.Type.OBJECT,
        description=structured_output_schema_description,
        required=list(structured_output_schema.keys()),
        properties=properties,
    ),
    system_instruction=[
        types.Part.from_text(text=system_prompt),
    ]
)

def get_gemini_output(pdf_url: str):
    """
    Fetches a PDF from a URL and sends it to the Gemini API
    for structured data extraction.
    """
    if not genai_client:
        print("[Error] Gemini client not initialized. Cannot extract data.", file=sys.stderr)
        return None
        
    print(f"Attempting to download PDF from: {pdf_url}")
    try:
        # Download the PDF content from the URL
        response = requests.get(pdf_url)
        response.raise_for_status()  # Raise an exception for bad status codes
        pdf_bytes = response.content
        print("PDF downloaded successfully.")
    except requests.exceptions.RequestException as e:
        print(f"\n[Error] Error fetching PDF from URL: {e}", file=sys.stderr)
        return None

    # Prepare the content for the Gemini API
    contents = [
        types.Part.from_bytes(
            data=pdf_bytes,
            mime_type='application/pdf',
        )
    ]

    trial = 0
    while True:
        trial += 1
        print('\r\x1b[2K', end='')
        print(f"Attempt #{trial} | Retrieving Model Output for {pdf_url}...", end='')

        try:
            # Send the request to the model
            response = genai_client.models.generate_content(
                model="gemini-flash-latest",
                contents=contents,
                config=model_config
            )

            if (response.parsed):
                break  # Success!
            else:
                print(f"\nAttempt #{trial} | Received empty response. Retrying in 5s...")

        except Exception as e:
            print(f"\nAttempt #{trial} | Error during API call: {e}. Retrying in 5s...")
            # Simple API key rotation logic (if you have multiple)
            # global gemini_api_key_id, genai_client
            # gemini_api_key_id = (gemini_api_key_id + 1) % len(gemini_api_keys)
            # genai_client = genai.Client(api_key=gemini_api_keys[gemini_api_key_id])
            # print(f"Rotated to Gemini API Key ID: {gemini_api_key_id}")
            
        sleep(5)

    print('\r\x1b[2K', end='')
    print(f"Attempt #{trial} | Model Output Retrieved for {pdf_url}.")
    return response.parsed


# =============================================================================
# AGENT 3: Supabase Uploader
# =============================================================================

def init_supabase_client():
    """
    Initializes and returns the Supabase client.
    """
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    
    if not url or not key:
        print("Error: SUPABASE_URL and SUPABASE_KEY must be set in your .env file.", file=sys.stderr)
        return None
        
    print("Connecting to Supabase...")
    try:
        supabase: Client = create_client(url, key)
        print("Successfully connected to Supabase.")
        return supabase
    except Exception as e:
        print(f"Error connecting to Supabase: {e}", file=sys.stderr)
        return None

def add_incident(supabase: Client, incident_data: dict):
    """
    Inserts a new incident into the 'incidents' table.
    """
    if not supabase:
        print("Supabase client is not initialized. Cannot add incident.", file=sys.stderr)
        return

    print(f"Attempting to add new incident for mine: {incident_data.get('mine')}")
    
    try:
        # Assumes your table is named 'incidents'
        data, count = supabase.table('incidents').insert([incident_data]).execute()
        
        if data and len(data[1]) > 0:
            print("Successfully added new incident to the 'incidents' table.")
        else:
            print("Failed to add incident. No data returned or error occurred.", file=sys.stderr)
            print(f"Full response: {data}, {count}", file=sys.stderr)
            
    except Exception as e:
        print(f"An error occurred while inserting data: {e}", file=sys.stderr)


# =============================================================================
# MAIN WORKFLOW LOOP
# =============================================================================

def main_loop(url: str, json_path: str, interval: int, dev_url: str = None, once: bool = False, 
              supabase_client: Client = None, genai_client_obj: genai.Client = None):
    
    target_url = dev_url if dev_url else url
    print(f"Watching for new safety alerts. URL={target_url!r} json={json_path} interval={interval}s")
    
    known = load_known(json_path)
    print(f"Loaded {len(known)} known alerts from {json_path!r}")

    while True:
        try:
            html = fetch_html(target_url)
        except Exception as e:
            print(f"[ERROR] Failed to fetch page: {e}", file=sys.stderr)
            if once:
                break
            time.sleep(interval)
            continue

        base = target_url
        found_urls = extract_pdf_names_and_urls(html, base_url=base)

        # Compute which are new (present in found but not in known)
        new_alerts = {}
        new_basenames = []
        for basename, full_url in found_urls.items():
            if basename not in known:
                new_alerts[basename] = full_url
                new_basenames.append(basename)

        if new_alerts:
            print(f"\n[NEW ALERTS FOUND] {len(new_alerts)} new:")
            for n in new_basenames:
                print(" -", n)
            
            # --- Save new alerts to JSON *before* processing ---
            # This prevents reprocessing a failed item on every poll
            known.extend(new_basenames)
            save_known_atomic(known, json_path)
            print(f"Updated {json_path!r} (now {len(known)} total alerts).")
            
            print(f"\n--- Processing {len(new_alerts)} new alerts ---")
            
            for basename, full_url in new_alerts.items():
                print(f"\n[Processing] Alert: {basename} | URL: {full_url}")
                try:
                    # --- Step 2: Extract Data with Gemini ---
                    extracted_data = get_gemini_output(full_url)
                    
                    if extracted_data:
                        print("--- Extracted Details ---")
                        print(json.dumps(extracted_data, indent=2))
                        print("-------------------------")
                        
                        # --- Step 3: Upload to Supabase ---
                        add_incident(supabase_client, extracted_data)
                    else:
                        print(f"[Error] Failed to get structured data for {basename}", file=sys.stderr)
                        
                except Exception as e:
                    print(f"[Error] Unhandled exception processing {basename}: {e}", file=sys.stderr)
                    
            print("\n--- Finished processing new alerts ---")

        else:
            print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] No new alerts (found {len(found_urls)} total).")

        if once:
            print("Run complete (--once specified). Exiting.")
            break
        
        print(f"Sleeping for {interval} seconds...")
        time.sleep(interval)


# =============================================================================
# SCRIPT EXECUTION
# =============================================================================

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Watch DGMS safety alerts, extract data, and upload to Supabase.")
    parser.add_argument("--url", "-u", default=DEFAULT_URL, help="URL of the alerts page to poll (used if --dev-url not provided).")
    parser.add_argument("--json", "-j", default=DEFAULT_JSON, help="JSON file path storing known alert names (list).")
    parser.add_argument("--interval", "-i", type=int, default=DEFAULT_INTERVAL, help=f"Polling interval in seconds (default {DEFAULT_INTERVAL}).")
    parser.add_argument("--dev-url", "-d", help="URL of a dev page to use instead of the default URL.")
    parser.add_argument("--once", action="store_true", help="Run once and exit (handy for testing).")

    args = parser.parse_args()

    # Initialize Supabase Client (from Agent 3)
    supabase_client = init_supabase_client()
    
    # Check if Gemini Client was initialized successfully (from Agent 2)
    if not genai_client:
        print("Exiting due to Gemini client initialization failure.", file=sys.stderr)
        raise SystemExit(1)

    try:
        # Run the main workflow loop
        main_loop(
            url=args.url, 
            json_path=args.json, 
            interval=args.interval, 
            dev_url=args.dev_url, 
            once=args.once,
            supabase_client=supabase_client,
            genai_client_obj=genai_client
        )
    except KeyboardInterrupt:
        print("\nInterrupted by user — exiting.")
        raise SystemExit(0)