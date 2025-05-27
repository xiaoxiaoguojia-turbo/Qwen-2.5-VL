# Ollama API 快速参考手册

## 基础信息

**服务地址**: `http://localhost:11434`  
**内容类型**: `Content-Type: application/json`  
**方法**: 主要使用 `POST` 请求

## 核心API端点

### 1. 文本生成与图片分析 ⭐⭐⭐⭐⭐
**端点**: `/api/generate`

#### 请求格式
```json
{
  "model": "qwen2.5vl:7b",
  "prompt": "你的问题或指令",
  "stream": false,
  "images": ["base64编码的图片数据"],
  "system": "系统提示信息",
  "options": {
    "temperature": 0.7,
    "top_p": 0.9,
    "num_predict": 128
  }
}
```

#### curl命令示例
```bash
# 文本生成
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen2.5vl:7b","prompt":"你好","stream":false}'

# 图片分析
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d @request.json
```

#### 响应格式
```json
{
  "model": "qwen2.5vl:7b",
  "created_at": "2024-01-01T12:00:00Z",
  "response": "AI生成的回复内容",
  "done": true,
  "context": [数值数组],
  "total_duration": 1000000000,
  "load_duration": 500000000,
  "prompt_eval_count": 10,
  "prompt_eval_duration": 300000000,
  "eval_count": 50,
  "eval_duration": 700000000
}
```

### 2. 多轮对话 ⭐⭐⭐⭐
**端点**: `/api/chat`

#### 请求格式
```json
{
  "model": "qwen2.5vl:7b",
  "messages": [
    {"role": "system", "content": "你是一个AI助手"},
    {"role": "user", "content": "用户消息"},
    {"role": "assistant", "content": "AI回复"}
  ],
  "stream": false
}
```

### 3. 模型管理 ⭐⭐⭐

#### 查看已安装模型
**端点**: `/api/tags`
```bash
curl http://localhost:11434/api/tags
```
**响应**:
```json
{
  "models": [
    {
      "name": "qwen2.5vl:7b",
      "size": 4661224448,
      "digest": "sha256:...",
      "details": {
        "parameter_size": "7.6B",
        "quantization_level": "Q4_0"
      }
    }
  ]
}
```

#### 查看模型详情
**端点**: `/api/show`
```bash
curl -X POST http://localhost:11434/api/show \
  -H "Content-Type: application/json" \
  -d '{"name":"qwen2.5vl:7b"}'
```

#### 下载模型
**端点**: `/api/pull`
```bash
curl -X POST http://localhost:11434/api/pull \
  -H "Content-Type: application/json" \
  -d '{"name":"llama2:7b","stream":false}'
```

### 4. 系统状态监控 ⭐⭐

#### 查看运行中的模型
**端点**: `/api/ps`
```bash
curl http://localhost:11434/api/ps
```

#### 查看版本信息
**端点**: `/api/version`
```bash
curl http://localhost:11434/api/version
```

### 5. 文本嵌入向量 ⭐
**端点**: `/api/embeddings`
```bash
curl -X POST http://localhost:11434/api/embeddings \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen2.5vl:7b","prompt":"文本内容"}'
```

## 解决Windows命令行长度限制

### 问题
Windows CMD 命令行长度限制约为 **8192字符**，无法直接传递大型Base64图片数据。

### 解决方案：使用文件传输

#### 步骤1：创建JSON请求文件
```json
{
  "model": "qwen2.5vl:7b",
  "prompt": "描述这张图片",
  "stream": false,
  "images": ["你的base64图片数据"]
}
```

#### 步骤2：使用文件发送请求
```bash
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d @request.json
```

#### PowerShell自动化脚本
```powershell
# 读取图片并生成请求文件
param([string]$ImagePath)
$imageBytes = [System.IO.File]::ReadAllBytes($ImagePath)
$base64String = [System.Convert]::ToBase64String($imageBytes)
$requestData = @{
    model = "qwen2.5vl:7b"
    prompt = "描述这张图片"
    stream = $false
    images = @($base64String)
}
$requestData | ConvertTo-Json -Depth 10 | Out-File "request.json" -Encoding UTF8
```

## 常用参数说明

### 核心参数
- **model**: 模型名称（必需）
- **prompt**: 输入文本（必需）
- **stream**: 是否流式输出，建议设为 `false`
- **images**: Base64编码的图片数组（图片分析时使用）

### 生成选项 (options)
- **temperature**: 创造性程度 (0.0-2.0，推荐0.7)
- **top_p**: 核采样参数 (0.0-1.0，推荐0.9)
- **top_k**: Top-K采样 (推荐40)
- **num_predict**: 最大生成token数
- **repeat_penalty**: 重复惩罚 (推荐1.1)

## 故障排除

### 常见错误码
- **200**: 成功 ✅
- **400**: 请求格式错误，检查JSON格式
- **404**: 模型不存在或API路径错误
- **500**: 服务器内部错误，通常是内存不足

### 调试命令
```bash
# 1. 测试服务器连接
curl http://localhost:11434/api/version

# 2. 检查可用模型
curl http://localhost:11434/api/tags

# 3. 详细输出调试
curl -v -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen2.5vl:7b","prompt":"test","stream":false}'
```

### JSON格式验证
```bash
# 使用jq验证JSON格式
echo '{"model":"qwen2.5vl:7b","prompt":"test"}' | jq .
```

## 实用技巧

### 1. 批量测试脚本
创建 `test_api.bat`:
```batch
@echo off
echo 测试1: 检查服务器状态
curl http://localhost:11434/api/version

echo 测试2: 查看可用模型  
curl http://localhost:11434/api/tags

echo 测试3: 简单文本生成
curl -X POST http://localhost:11434/api/generate ^
  -H "Content-Type: application/json" ^
  -d "{\"model\":\"qwen2.5vl:7b\",\"prompt\":\"你好\",\"stream\":false}"
```

### 2. PowerShell快速调用
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:11434/api/generate" `
  -Method Post -ContentType "application/json" `
  -Body '{"model":"qwen2.5vl:7b","prompt":"你好","stream":false}'
$response.response
```

### 3. 响应保存到文件
```bash
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d @request.json \
  -o response.json
```

## 端点使用频率参考

| 端点 | 频率 | 用途 |
|------|------|------|
| `/api/generate` | ⭐⭐⭐⭐⭐ | 日常AI对话和图片分析 |
| `/api/chat` | ⭐⭐⭐⭐ | 多轮对话 |
| `/api/tags` | ⭐⭐⭐ | 检查可用模型 |
| `/api/ps` | ⭐⭐ | 系统监控 |
| `/api/show` | ⭐⭐ | 模型详情 |
| `/api/pull` | ⭐ | 下载新模型 |

---
*最后更新: 2024年*  
*适用于: Ollama v0.1.x+*