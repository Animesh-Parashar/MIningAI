# MineSafeAI: Revolutionizing Mining Safety with AI-Powered Insights

Mining accidents have historically been a significant concern in India, requiring effective safety measures and thorough analysis to prevent future incidents. MineSafeAI addresses this critical need by leveraging the power of Natural Language Processing (NLP) and agentic AI to digitize, analyze, and provide real-time insights from extensive collections of Indian mining accident records.

Our platform is designed to transform how safety data is processed and utilized, moving beyond traditional methods to offer an intelligent, proactive approach to accident prevention and regulatory compliance. By analyzing over 143 incident records from DGMS India (2015-2025), MineSafeAI aims to enhance safety, reduce human labor in auditing, and provide deeper, more accurate insights into accident patterns and root causes.

## 🌟 Features

MineSafeAI combines real-time data analysis, AI-powered insights, and collaborative features to enhance mining operations safety and efficiency.

### Core AI & Data Processing
* **Intelligent PDF Data Extraction:** Utilizes OCR to read text from DGMS PDF documents and BERT for Named Entity Recognition to extract critical accident information.
* **Structured JSON Schema Conversion:** Converts extracted data into a standardized JSON format, making it easily queryable and analyzable:

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
      "best_practices": "Best Practices only if the text best practices is explicitly mentioned",
      "cause_label": "Analyze the cause and classify among 'Fire', 'Explosion', 'Roof Fall', 'Fall', 'Machinery', 'Transport', 'Electricity', 'Ground Movement', 'Eruption Of Water', 'Flying Pieces', 'Combustible Gas', 'Inundation'"
    }
    ```
* **Autonomous Safety Monitoring Agents:**
    * **Watch Agent:** Continuously scans the DGMS alert website for new updates.
    * **Fetch Agent:** Automatically processes new PDF alerts, converting them to the structured JSON schema using advanced NLP techniques.
    * **Database Update Agent:** Integrates processed data into the central database in real-time.
    * **Proactive Alert Generation:** Automatically classifies incidents, flags potential hazards, and generates actionable alerts (e.g., "Increase in transportation machinery accidents in Jharkhand mines in Q3 2022").
    * **Recommendation Engine:** Recommends targeted inspections or preventive measures to mine operators based on detected patterns.
* **Interactive "Digital Mine Safety Officer":** A conversational, agentic AI layer that allows users to:
    * Query domain-specific information (e.g., "Show me all methane-related accidents in 2021 in underground coal mines").
    * Receive suggestions for regulatory compliance actions (e.g., "Mine X exceeds threshold for ground movement incidents; schedule slope stability inspection").

### Platform & UI Features
* **Real-time Monitoring Dashboard:** Provides an overview of accident trends, locations, and timelines through a simple, interactive interface.
* **Interactive Map Visualization:** Pinpoints accident locations and visualizes spatial trends.
* **AI-powered Chat Interface:** Enables natural language queries and insights from the "Digital Mine Safety Officer."
* **Safety Reports Generation:** Automates the creation of detailed safety audit reports, reducing manual labor while increasing accuracy and depth.
* **Trend Analysis:** Identifies patterns and emerging risks in accident data, providing crucial foresight.
* **Administrative Controls & System Settings:** Manages user roles, permissions, and platform configurations.

## 🚀 Project Structure

```plaintext
├── backend/                # Backend server implementation
│   ├── server.js           # Express server setup
│   ├── router.js           # API route definitions
│   └── supabase.js         # Supabase client configuration
│
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── lib/            # Utility functions and configurations
│   │   └── pages/          # Page components
│   └── public/             # Static assets
````

## 💾 Database Schema

This diagram shows the entity-relationship diagram (ERD) for our Supabase database, detailing the tables and relationships used to store incident data.

## 🛠 Technologies Used

### Frontend

  \* **React 18 with TypeScript:** For a robust and scalable user interface.
  \* **Vite:** Fast build tooling for development and production.
  \* **TailwindCSS:** For rapid and consistent styling.
  \* **Framer Motion:** For smooth and engaging animations.
  \* **React Router:** For seamless navigation within the application.
  \* **Recharts:** For clear and interactive data visualization.
  \* **React Leaflet:** For interactive map visualizations of mining incidents.
  \* **Supabase Client:** For real-time data synchronization and interaction.

### Backend

  \* **Node.js with Express:** A powerful and flexible backend framework.

  * **Google AI:** For generative AI features and advanced natural language processing.
      \* **Supabase:** For robust database management, real-time subscriptions, and authentication.
      \* **Axios:** For efficient HTTP requests.
      \* **CORS:** For secure cross-origin resource sharing.
      \* **OCR Libraries:** For extracting text from PDF documents.
      \* **BERT (via NLP libraries):** For Named Entity Recognition to structure unstructured text data.

## 💡 How Agentic AI Can Help

The integration of agentic AI elevates MineSafeAI beyond a simple data analysis tool:

  * **Autonomous Safety Monitoring Agents:** These agents act autonomously, continuously scanning for new DGMS updates, mine inspection reports, and local news. They automatically classify incidents, flag potential hazards, and generate targeted alerts.
  * **Interactive "Digital Mine Safety Officer":** This conversational, agentic layer provides a dynamic way for users to interact with the data, answering complex queries, suggesting regulatory compliance actions, and recommending proactive measures.

## 🎬 Getting Started

### Prerequisites

  \* Node.js (latest LTS version)
  \* npm or yarn package manager
  \* Supabase account and project setup
  \* Google AI API Key

### Installation

1.  Clone the repository:

    ` bash     git clone [https://github.com/Animesh-Parashar/MIningAI.git](https://github.com/Animesh-Parashar/MIningAI.git)     cd MIningAI      `

2.  Install backend dependencies:

    ` bash     cd backend     npm install      `

3.  Install frontend dependencies:

    ` bash     cd ../frontend     npm install      `

### Configuration

1.T Create a `.env` file in the `backend` directory with your Supabase and Google AI credentials:

    ` env     SUPABASE_URL=your_supabase_url     SUPABASE_KEY=your_supabase_key     GOOGLE_AI_API_KEY=your_google_ai_key      `

2.  Configure the frontend Supabase client in `frontend/src/lib/supabaseClient.js` with your Supabase credentials.

### Running the Application

1.  Start the backend server:

    ` bash     cd backend     npm run dev      `

2.  Start the frontend development server:

    ` bash     cd frontend     npm run dev      `

The application will be available at `http://localhost:5173`.

## ⚙ Development

### Available Scripts

#### Backend:

  \* `npm start`: Start the production server.
  \* `npm run dev`: Start development server with hot-reload.

#### Frontend:

  \* `npm run dev`: Start development server.
  \* `npm run build`: Build for production.
  \* `npm run preview`: Preview production build.
  \* `npm run lint`: Run ESLint for code quality.
  \* `npm run typecheck`: Run TypeScript type checking.

## 🤝 Contributing

We welcome contributions to MineSafeAI\! To contribute:

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

## 📄 License

This project is proprietary and confidential. All rights reserved.

## 📞 Contact

Animesh Parashar - [GitHub Profile](https://github.com/Animesh-Parashar)

Project Link: [https://github.com/Animesh-Parashar/MIningAI](https://github.com/Animesh-Parashar/MIningAI)
