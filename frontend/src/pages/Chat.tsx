import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello! I'm your Digital Mine Safety Officer. I can help you analyze accident data, provide safety recommendations, and answer questions about mining safety protocols. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let response = '';

      if (input.toLowerCase().includes('roof fall')) {
        response =
          "Analyzing roof fall incidents from 2016-2022:\n\n📊 STATISTICS:\n• Total roof fall incidents: 62 (23% of all accidents)\n• Peak year: 2017 with 12 incidents\n• Most affected region: Jharkhand (38% of cases)\n• Underground coal mines: 85% of roof fall incidents\n\n⚠️ PRIMARY CAUSES:\n1. Inadequate roof bolting (42%)\n2. Geological stress changes (28%)\n3. Delayed support installation (18%)\n4. Weathering of strata (12%)\n\n✅ RECOMMENDATIONS:\n• Implement real-time roof monitoring systems\n• Increase frequency of geotechnical surveys\n• Enforce immediate support installation protocols\n• Conduct quarterly roof stability assessments\n• Deploy modern roof bolting equipment";
      } else if (input.toLowerCase().includes('2021')) {
        response =
          "Mining Safety Overview - 2021:\n\n📈 YEAR SUMMARY:\n• Total incidents: 33\n• Fatalities: 41 workers\n• Serious injuries: 87\n• Year-over-year change: -19% (improvement)\n\n🎯 KEY HIGHLIGHTS:\n• Best safety performance since 2016\n• Zero major gas explosion events\n• Successful implementation of predictive monitoring in 15 sites\n• 94% compliance rate with safety protocols\n\n⚡ TOP INCIDENT TYPES:\n1. Machinery failures: 28%\n2. Roof falls: 22%\n3. Transport accidents: 18%\n4. Fire incidents: 15%\n5. Others: 17%\n\nThe data shows significant improvement in proactive safety measures.";
      } else if (input.toLowerCase().includes('coal mine') || input.toLowerCase().includes('preventive')) {
        response =
          "PREVENTIVE ACTIONS FOR COAL MINES:\n\n🛡️ PRIORITY 1 - GAS MONITORING:\n• Install continuous methane detection systems\n• Mandatory gas testing before each shift\n• Automated ventilation control systems\n• Emergency response protocols\n\n⚙️ PRIORITY 2 - EQUIPMENT SAFETY:\n• Weekly machinery inspections\n• Predictive maintenance scheduling\n• Operator certification programs\n• Real-time equipment health monitoring\n\n👷 PRIORITY 3 - PERSONNEL TRAINING:\n• Monthly safety drills\n• Hazard recognition training\n• Emergency evacuation procedures\n• First aid and rescue operations\n\n🔍 PRIORITY 4 - STRUCTURAL INTEGRITY:\n• Daily roof and rib inspections\n• Systematic ground control measures\n• Geotechnical monitoring\n• Support installation verification\n\nImplementing these measures can reduce incidents by up to 60%.";
      } else {
        response =
          "I can help you with:\n\n📊 Data Analysis:\n• Show statistics for specific years, regions, or mine types\n• Analyze trends and patterns\n• Compare safety metrics\n\n🎯 Safety Recommendations:\n• Preventive measures for specific mine types\n• Best practices and protocols\n• Risk mitigation strategies\n\n🔍 Incident Investigation:\n• Root cause analysis\n• Similar incident patterns\n• Lessons learned\n\nTry asking: 'Show roof fall incidents in 2021' or 'Suggest preventive actions for coal mines'";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-white">Digital Mine Safety Officer (AI Chat)</h1>

      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl h-[600px] flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start space-x-3 max-w-[80%] ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' ? 'bg-[#00BFA5]' : 'bg-[#2A2A2A]'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-[#00BFA5]" />
                  )}
                </div>
                <div
                  className={`px-4 py-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-[#00BFA5] text-white'
                      : 'bg-[#0D0D0D] border border-[#2A2A2A] text-[#E0E0E0]'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#2A2A2A]">
                  <Bot className="w-5 h-5 text-[#00BFA5]" />
                </div>
                <div className="px-4 py-3 rounded-lg bg-[#0D0D0D] border border-[#2A2A2A]">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-[#00BFA5] rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-[#00BFA5] rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-[#00BFA5] rounded-full animate-bounce"
                      style={{ animationDelay: '0.4s' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-[#2A2A2A] p-4">
          <div className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask: 'Show roof fall incidents in 2021' or 'Suggest preventive actions for coal mines'"
              className="flex-1 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-4 py-3 text-[#E0E0E0] placeholder-[#888888] focus:outline-none focus:border-[#00BFA5]"
              disabled={isTyping}
            />
            <button
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              className="bg-[#00BFA5] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#00E676] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
