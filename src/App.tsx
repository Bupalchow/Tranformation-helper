import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import { 
  Download, Type, Bold, Italic, List, ListOrdered, 
  Image as ImageIcon, AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, BarChart as FlowChart, Palette,
} from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mermaid from 'mermaid';

const genAI = new GoogleGenerativeAI('AIzaSyAZXyCK5sgFoCv9Fhsgtn-wBqt4DqbyY7U');
mermaid.initialize({ startOnLoad: true });

interface CalendarDay {
  day: number;
  content: string;
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addFlowchart = () => {
    const flowchartCode = `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]`;
    
    editor.chain().focus().insertContent({
      type: 'codeBlock',
      attrs: { language: 'mermaid' },
      content: [{ type: 'text', text: flowchartCode }]
    }).run();
  };

  const setLink = () => {
    const url = window.prompt('Enter URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div id="toolbar" className="flex flex-wrap gap-2 p-2 border-b bg-gray-50">
      <div className="flex gap-1 p-1 bg-white rounded shadow-sm">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
        >
          <Italic className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-1 p-1 bg-white rounded shadow-sm">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
        >
          <ListOrdered className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-1 p-1 bg-white rounded shadow-sm">
        <button
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''}`}
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''}`}
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''}`}
        >
          <AlignRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-1 p-1 bg-white rounded shadow-sm">
        <button
          onClick={addImage}
          className="p-2 rounded hover:bg-gray-100"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <button
          onClick={setLink}
          className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('link') ? 'bg-gray-200' : ''}`}
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          onClick={addFlowchart}
          className="p-2 rounded hover:bg-gray-100"
        >
          <FlowChart className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-1 p-1 bg-white rounded shadow-sm">
        <input
          type="color"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          className="w-8 h-8 p-0 border-none rounded cursor-pointer"
        />
        <Palette className="w-4 h-4 ml-2 mt-2" />
      </div>
    </div>
  );
};

function App() {
  const [topic, setTopic] = useState('');
  const [transformationType, setTransformationType] = useState('personal'); // new
  const [loading, setLoading] = useState(false);
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Link,
    ],
    content: `
      <h1 style="text-align: center">My Transformation Journey</h1>
      <p style="text-align: center">Document your journey of change and growth...</p>
    `,
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none',
      },
    },
  });

  useEffect(() => {
    const renderMermaid = async () => {
      const elements = document.querySelectorAll('pre code.language-mermaid');
      elements.forEach(async (element) => {
        try {
          const chart = await mermaid.render('mermaid-' + Math.random(), element.textContent || '');
          element.parentElement?.insertAdjacentHTML('afterend', chart.svg);
          element.parentElement?.remove();
        } catch (error) {
          console.error('Error rendering mermaid chart:', error);
        }
      });
    };

    renderMermaid();
  }, [editor?.getHTML()]);

  const downloadCalendar = async (element: HTMLDivElement) => {
    try {
      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1,
        backgroundColor: '#ffffff',
        style: {
          padding: '2rem',
          borderRadius: '0.5rem',
        }
      });
      
      const link = document.createElement('a');
      link.download = `${topic.toLowerCase().replace(/\s+/g, '-')}-calendar.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Calendar generation error:', error);
    }
  };

  const downloadJourney = async (element: HTMLDivElement) => {
    try {
      const dataUrl = await htmlToImage.toPng(element, {
        backgroundColor: '#ffffff',
        style: {
          padding: '2rem',
          borderRadius: '0.5rem',
        }
      });
      const link = document.createElement('a');
      link.download = `${topic.toLowerCase().replace(/\s+/g, '-')}-journey.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
    }
  };

  const generateContent = async () => {
    if (!topic.trim()) return;
    
    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const journeyPrompt = `Create a comprehensive transformation journey for "${topic}" in the context of "${transformationType}".
      Return the response in this exact HTML format:
      
      <div class="max-w-4xl mx-auto space-y-8">
        <div class="text-center">
          <h1 class="text-3xl font-bold text-blue-800 mb-4">${topic} - Transformation Journey</h1>
          <p class="text-xl text-gray-600">A 30-day roadmap to mastery</p>
        </div>

        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
          <h2 class="text-2xl font-bold text-blue-900 mb-4">🎯 Vision & Purpose</h2>
          <p class="text-lg leading-relaxed">[Write 2-3 compelling sentences about the vision]</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-xl font-bold text-blue-800 mb-4">💪 Key Skills to Master</h2>
            <ul class="space-y-3">
              [List 5 essential skills with brief descriptions]
            </ul>
          </div>
          
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-xl font-bold text-blue-800 mb-4">📚 Learning Resources</h2>
            <ul class="space-y-3">
              [List 5 specific resources with links or descriptions]
            </ul>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-bold text-blue-800 mb-4">🎯 Weekly Objectives</h2>
          <div class="space-y-4">
            <div class="border-l-4 border-blue-500 pl-4">
              <h3 class="font-bold text-lg">Week 1: Foundation</h3>
              <p class="text-gray-600 mb-2">Focus: [Week 1 focus area]</p>
              <ul class="list-disc ml-4 space-y-2">
                [List 3-4 specific objectives]
              </ul>
            </div>
            [Repeat similar structure for Weeks 2-4]
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-xl font-bold text-blue-800 mb-4">📈 Success Metrics & Milestones</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            [List 4-6 specific, measurable outcomes]
          </div>
        </div>

        <div class="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
          <h2 class="text-xl font-bold text-blue-800 mb-4">🚀 Next Steps</h2>
          <ol class="list-decimal ml-4 space-y-2">
            [List 3-4 immediate actions to get started]
          </ol>
        </div>
      </div>`;

      const journeyResult = await model.generateContent(journeyPrompt);
      const journeyResponse = await journeyResult.response;
      editor?.commands.setContent(journeyResponse.text());

      // Modified calendar prompt
      const calendarPrompt = `Create a practical 30-day learning plan for "${topic}".
      For each day, provide ONE clear, simple action or a tool to learn, item without any markdown symbols or formatting.
      Make it progressive, starting from basics and building up.
      Focus on hands-on practice and real-world applications.
      Keep each task concise and actionable.
      Format as plain text, one task per day.
      Example format:
      1. Install required software and setup workspace
      2. Complete introduction tutorial
      3. Practice basic exercises
      ...and so on for 30 days.
      notes: the actions nust be simple and also provide tools that users can use.
      `;

      const calendarResult = await model.generateContent(calendarPrompt);
      const calendarResponse = await calendarResult.response;
      
      const dailyTasks = calendarResponse.text()
        .split('\n')
        .filter(line => line.trim())
        .slice(0, 30)
        .map(line => line.replace(/^\d+\.\s*/, '').trim());

      setCalendarData(dailyTasks.map((content, index) => ({
        day: index + 1,
        content
      })));
    } catch (error) {
      console.error('Error generating content:', error);
      editor?.commands.setContent(`
        <div class="text-center text-red-500">
          <h1 class="text-2xl font-bold">Error Creating Your Journey</h1>
          <p>Please try again</p>
        </div>
      `);
    } finally {
      setLoading(false);
    }
  };

  // Modified calendar rendering
  const renderCalendar = () => {
    if (calendarData.length === 0) return null;

    return (
      <div className="space-y-6">
        {/* Calendar Header */}
        <div className="text-center space-y-2 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-2xl font-bold text-blue-800">{topic}</h2>
          <p className="text-lg text-gray-600">30-Day Transformation Journey</p>
          <p className="text-sm text-gray-500 italic">"Every day is a new opportunity for growth and progress"</p>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-6 gap-2 p-4">
          {calendarData.map((day) => (
            <div 
              key={day.day}
              className={`p-3 border rounded-lg transition-all hover:shadow-md
                ${day.day % 7 === 0 ? 'bg-blue-50' : 'bg-white'}`}
            >
              <div className="font-bold text-gray-800 mb-2">Day {day.day}</div>
              <p className="text-sm text-gray-600">
                {day.content.replace(/[*#`]/g, '').trim()}
              </p>
            </div>
          ))}
        </div>

        {/* Calendar Footer */}
        <div className="text-center space-y-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <h3 className="text-xl font-semibold text-blue-800">Your Future Success</h3>
          <p className="text-gray-600">
            After completing this 30-day journey, you'll have developed strong foundations in {topic.toLowerCase()}.
            Keep practicing and building upon these skills!
          </p>
          <p className="text-sm text-gray-500">
            Remember: Consistency is the key to mastery
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h1 className="text-5xl font-bold text-center mb-4 text-blue-600">Transform Journey</h1>
            <div className="flex gap-4 mb-4">
              <select
                value={transformationType}
                onChange={(e) => setTransformationType(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="personal">Personal Growth</option>
                <option value="professional">Career Development</option>
                <option value="health">Health & Wellness</option>
                <option value="learning">Learning Journey</option>
                <option value="creative">Creative Evolution</option>
              </select>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What would you like to transform? (e.g., 'My public speaking skills')"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={generateContent}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
              >
                <Type className="w-5 h-5" />
                {loading ? 'Creating...' : 'Create Journey'}
              </button>
            </div>
          </div>

          {/* Calendar Section */}
          <div className="bg-white rounded-lg shadow-lg relative">
            <button 
              onClick={() => {
                const element = document.getElementById('calendar-content');
                if (element) downloadCalendar(element as HTMLDivElement);
              }}
              className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
              title="Download Calendar"
            >
              <Download className="w-5 h-5" />
            </button>
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">30-Day Learning Plan</h2>
            </div>
            <div id="calendar-content">
              {renderCalendar()}
            </div>
          </div>

          {/* Journey Content Section */}
          <div className="bg-white rounded-lg shadow-lg relative">
            <button 
              onClick={() => {
                const element = document.getElementById('content-area');
                if (element) downloadJourney(element as HTMLDivElement);
              }}
              className="absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full z-10"
              title="Download Journey"
            >
              <Download className="w-5 h-5" />
            </button>
            <MenuBar editor={editor} />
            <div id="content-area" className="p-8">
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
