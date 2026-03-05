# 🛡️ MineSafeAI: Revolutionizing Mining Safety with AI-Powered Insights

Mining accidents have historically been a significant concern in India, demanding effective safety measures and thorough analysis to prevent future incidents. **MineSafeAI** addresses this critical need by leveraging **Natural Language Processing (NLP)** and **Agentic AI** to digitize, analyze, and provide **real-time insights** from extensive collections of Indian mining accident records.

Our platform transforms how safety data is processed and utilized — moving beyond traditional manual reporting to deliver intelligent, proactive accident prevention and regulatory compliance. By analyzing **143+ incident records** from **DGMS India (2015–2025)**, MineSafeAI aims to enhance safety, reduce manual auditing effort, and uncover deep insights into accident patterns and root causes.

---

## 🌟 Features

MineSafeAI combines real-time data analysis, AI-powered insights, and collaborative features to make mining operations safer and more efficient.

### 🧠 Core AI & Data Processing

* **Intelligent PDF Data Extraction:**
  Uses OCR to read text from DGMS PDF reports and **BERT-based NER** models to extract critical accident details.

* **Structured JSON Schema Conversion:**
  Converts extracted data into a standardized, queryable format:

  ```json
  {
    "mine": "Name of the Mine",
    "owner": "Owner of the Mine",
    "district": "District of the Mine",
    "state": "State (location) of the Mine",
    "mineral": "Mineral of the Mine",
    "place": "Place of Accident",
    "date": "Date of Accident",
    "time": "Time of Accident",
    "casualties": "Number of People killed",
    "injured": "Number of People seriously injured",
    "cause": "Prime facie cause of the Accident",
    "best_practices": "Best Practices only if explicitly mentioned",
    "cause_label": "Classified as one of 'Fire', 'Explosion', 'Roof Fall', 'Fall', 'Machinery', 'Transport', 'Electricity', 'Ground Movement', 'Eruption Of Water', 'Flying Pieces', 'Combustible Gas', 'Inundation'"
  }
  ```
---
**Extracted Data**  

<img width="1868" height="723" alt="Screenshot 2025-11-05 002553" src="https://github.com/user-attachments/assets/0813e7fb-ad90-430e-ba55-2705cd9a73ed" />

  
---
* **Autonomous Safety Monitoring Agents:**

  * **Watch Agent:** Monitors DGMS alert websites for new updates.
  * **Fetch Agent:** Processes new PDF alerts and converts them to structured data.
  * **Database Update Agent:** Integrates processed data into Supabase in real time.
  * **Proactive Alert Engine:** Flags potential hazards (e.g., “Increase in transport machinery accidents in Jharkhand mines – Q3 2022”).
  * **Recommendation Engine:** Suggests preventive measures and inspection schedules.

* **Interactive “Digital Mine Safety Officer”:**
  A conversational AI interface that allows users to:

  * Query domain-specific information (e.g., “Show methane-related accidents in 2021 underground coal mines.”)
  * Receive compliance suggestions (e.g., “Mine X exceeds threshold for ground movement incidents; schedule slope stability inspection.”)

---

### 🖥️ Platform & UI Features

* **Real-time Monitoring Dashboard:** Interactive visual summary of accident trends and timelines.
* **Interactive Map Visualization:** Uses React Leaflet for spatial analysis of incidents.
* **AI-Powered Chat Interface:** Conversational insights from the “Digital Mine Safety Officer.”
* **Automated Safety Reports:** Generates detailed audit reports with zero manual effort.
* **Trend Analysis:** Identifies emerging risks using time-series and spatial patterns.
* **Admin Controls:** Manage user roles, permissions, and platform configurations.

---

## 🚀 Project Structure

```plaintext
├── backend/                  # Backend server implementation
│   ├── server.js              # Express server setup
│   ├── router.js              # API route definitions
│   └── supabase.js            # Supabase client configuration
│
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── lib/               # Utility functions and configurations
│   │   └── pages/             # Page components
│   └── public/                # Static assets
```

---

## 💾 Database Schema

MineSafeAI uses **Supabase** as a real-time, scalable database. The schema stores incident data, classified cause labels, extracted entities, and derived analytics.
(An ER diagram can be added here when finalized.)

---

## 🛠️ Technologies Used

### **Frontend**

* ⚛️ React 18 + TypeScript — scalable and type-safe UI.
* ⚡ Vite — lightning-fast dev and build tool.
* 🎨 TailwindCSS — utility-first styling framework.
* 🎞️ Framer Motion — smooth UI animations.
* 🧭 React Router — client-side navigation.
* 📊 Recharts — interactive data visualizations.
* 🗺️ React Leaflet — map visualizations for mining locations.
* 🧩 Supabase Client — real-time synchronization and querying.

### **Backend**

* 🟢 Node.js + Express — lightweight and fast backend framework.
* 🤖 Google AI — for generative insights and NLP tasks.
* 🧮 Supabase — managed Postgres + real-time database.
* 🌐 Axios — for efficient API requests.
* 🧾 OCR Libraries — for text extraction from DGMS PDFs.
* 🧠 BERT (via NLP frameworks) — Named Entity Recognition and cause classification.

---

## 💡 Agentic AI Integration

MineSafeAI incorporates **agentic AI** to move from reactive reporting to proactive safety intelligence.

* **Autonomous Monitoring Agents:** Continuously scan official sources for new incidents, classify causes, and generate alerts.
* **Digital Mine Safety Officer:** A domain-aware conversational agent that interacts with structured safety data, answering queries, suggesting compliance actions, and providing intelligent recommendations.

---

## 🎬 Getting Started

### Prerequisites

* Node.js (latest LTS)
* npm or yarn
* Supabase account + project
* Google AI API Key

### Installation

```bash
# Clone the repository
git clone https://github.com/Animesh-Parashar/MIningAI.git
cd MIningAI

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

Create a `.env` file in the **backend** directory:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
GOOGLE_AI_API_KEY=your_google_ai_key
```

Then, configure the frontend Supabase client in
`frontend/src/lib/supabaseClient.js` with your Supabase credentials.

### Running the Application

```bash
# Start backend
cd backend
npm run dev

# Start frontend
cd ../frontend
npm run dev
```

App available at: **[http://localhost:5173](http://localhost:5173)**

---

## ⚙️ Development

### Backend Scripts

* `npm start` — Run production server
* `npm run dev` — Run development server (with hot reload)

### Frontend Scripts

* `npm run dev` — Start dev server
* `npm run build` — Build for production
* `npm run preview` — Preview production build
* `npm run lint` — Run ESLint
* `npm run typecheck` — TypeScript validation

---

## 🤝 Contributing

We welcome contributions to **MineSafeAI**!

1. Fork the repository.
2. Create your feature branch:

   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes:

   ```bash
   git commit -m "Add some amazing feature"
   ```
4. Push to your branch:

   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request.

---

## 📄 License

This project is **proprietary and confidential.**
All rights reserved © 2025 MineSafeAI.

---

## 📞 Contact
**Authors**:  
**Abhishek Kurmi**  
**Animesh Parashar**
🔗 [GitHub Profile](https://github.com/Animesh-Parashar)
📘 [Project Repository](https://github.com/Animesh-Parashar/MIningAI)

---
