# @302ai/n8n-nodes-302ai-chat

[![NPM Version](https://img.shields.io/npm/v/n8n-nodes-302ai?style=flat-square)](https://www.npmjs.com/package/n8n-nodes-302ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![N8N Compatibility](https://img.shields.io/badge/N8N-v1.x-blueviolet?style=flat-square)](https://n8n.io)

This is an n8n community node for [302.AI](https://302.ai/) AI service integration.

## Prerequisites

You need to have a valid API key from [302.AI](https://302.ai/) to use this node.

## Installation

1.  Go to **Settings > Community Nodes** in your n8n instance.
2.  Select **Install** and enter `@302ai/n8n-nodes-302ai-chat` in the search box.
3.  Click **Install** to add the node to your n8n instance.

## Configuration

1.  In your n8n workflow, add the "302.AI" node.
2.  In the "Credentials" section, click on **Create New**.
3.  Give your credential a name.
4.  Enter your API key from `302.AI` into the **API Key** field.
5.  Click **Save** to create the credential.

## Usage

### Chat Operation

1.  **Model Name or ID**: Select from available 302.ai models
2.  **System Prompt**: (Optional) Provide context for the AI
3.  **Message**: Your input message
4.  **Additional Fields**: Temperature, max tokens, etc.

### Multimodal Support
- Supports both text and image inputs in chat conversations
- Compatible with vision-capable models for image understanding
- **Image URL**: Optional field to include images in your conversation
- **Supported formats**: HTTP/HTTPS image URLs or base64 encoded images
- **Use cases**: Image analysis, visual question answering, content understanding from images

## Output

- **Standard response**: `json.response` contains the model's reply
- **Error handling**: `json.error` for any API issues


## License

[MIT](LICENSE)
