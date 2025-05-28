import React, { useState } from 'react';
import { Moon, Sun, Loader2, Download, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { API_CONFIG } from '../config';
import { APIError } from '../types/api';

// API接口类型定义
interface GenerateResponse {
  success: boolean;
  imagePath: string;
  fileName: string;
}

/*
interface ErrorResponse {
  error: string;
  code: string;
}
*/

// 主题切换组件
const ThemeToggle = ({ isDark, toggleTheme }: { isDark: boolean; toggleTheme: () => void }) => (
  <button
    onClick={toggleTheme}
    className="fixed top-4 right-4 p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg transition-all hover:shadow-xl"
    aria-label="Toggle theme"
  >
    {isDark ? (
      <Sun className="h-6 w-6 text-yellow-500" />
    ) : (
      <Moon className="h-6 w-6 text-gray-700" />
    )}
  </button>
);

// 错误提示组件
const ErrorAlert = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
    <strong className="font-bold">错误！</strong>
    <span className="block sm:inline"> {message}</span>
    <button onClick={onClose} className="absolute top-0 bottom-0 right-0 px-4 py-3">
      <span className="sr-only">关闭</span>
      <AlertCircle className="h-6 w-6" />
    </button>
  </div>
);

// InputForm组件
interface InputFormProps {
  onGenerate: (input: string, fileName: string) => Promise<void>;
  isLoading: boolean;
  generatedImage: string | null;
}

// 输入表单组件
const InputForm: React.FC<InputFormProps> = ({ onGenerate, isLoading, generatedImage }) => {
  const [input, setInput] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      await onGenerate(input, fileName);
      setError(null);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data) {
        const errorData = err.response.data as APIError;
        setError(errorData.detail || '未知错误');
      } else {
        setError('生成过程中发生未知错误');
      }
    }
  };

  return (
    <div className="w-full max-w-2xl space-y-6">
      {error && (
        <ErrorAlert
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="请输入一个网址，或一个简单的主题，或是你需要整理的一大段文字..."
          className="w-full h-40 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                   shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   resize-none transition-colors"
        />
        <input
          type="text"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder="请输入要保存的文件名（可选）"
          className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-700 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                   shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   transition-colors"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-6 rounded-2xl bg-blue-500 hover:bg-blue-600 
                   text-white font-medium shadow-lg hover:shadow-xl 
                   transition-all duration-200 disabled:opacity-50 
                   disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              生成中...
            </>
          ) : (
            '生成'
          )}
        </button>
      </form>

      {generatedImage && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
          <img
            src={`${API_CONFIG.BASE_URL}${API_CONFIG.GENERATED_PATH}/${generatedImage}`}
            alt="生成的图片"
            className="w-full rounded-xl shadow-lg mb-4"
          />
          <button
            onClick={async () => {
              try {
                const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.GENERATED_PATH}/${generatedImage}`, {
                  headers: {
                    'Accept': 'image/png'
                  }
                });

                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = generatedImage || 'infographic.png';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
              } catch (error) {
                console.error('Download failed:', error);
                alert('下载失败，请重试');
              }
            }}
            className="w-full py-3 px-6 rounded-xl bg-green-500 hover:bg-green-600 
                     text-white font-medium shadow-md hover:shadow-lg 
                     transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Download className="h-5 w-5" />
            下载图片
          </button>
        </div>
      )}
    </div>
  );
};

// 主组件
const InfoGenerator: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleGenerate = async (input: string, fileName: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post<GenerateResponse>(
        `${API_CONFIG.BASE_URL}/api/generate`,  // 修改请求路径
        {
          input,
          fileName
        }
      );

      if (response.data.imagePath) {
        setGeneratedImage(response.data.imagePath);
      } else {
        throw new Error('No image path received');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''} transition-colors`}>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 
                    dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Infography 生成器
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              将您的内容转换为精美的信息图
            </p>
          </div>

          <div className="flex justify-center">
            <InputForm
              onGenerate={handleGenerate}
              isLoading={isLoading}
              generatedImage={generatedImage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoGenerator;
