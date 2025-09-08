"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThreeZeroTwoAI = void 0;
const n8n_workflow_1 = require("n8n-workflow");
class ThreeZeroTwoAI {
    constructor() {
        this.description = {
            displayName: '302.AI',
            name: 'threeZeroTwoAI',
            icon: 'file:../../icons/aiThreeZeroTwo.svg',
            group: ['transform'],
            version: 1,
            subtitle: '={{$parameter["operation"]}}',
            description: 'Interact with 302.ai AI services',
            defaults: {
                name: '302.AI',
            },
            inputs: '={{["main"]}}',
            outputs: '={{["main"]}}',
            credentials: [
                {
                    name: 'threeZeroTwoAIApi',
                    required: true,
                },
            ],
            properties: [
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Chat',
                            value: 'chat',
                            description: 'Send a chat message',
                            action: 'Send a chat message',
                        },
                    ],
                    default: 'chat',
                },
                {
                    displayName: 'Model Name or ID',
                    name: 'model',
                    type: 'options',
                    noDataExpression: true,
                    typeOptions: {
                        loadOptionsMethod: 'getModels',
                    },
                    required: true,
                    default: '',
                    description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
                },
                {
                    displayName: 'System Prompt',
                    name: 'system_prompt',
                    type: 'string',
                    typeOptions: {
                        rows: 4,
                    },
                    default: '',
                    description: 'System message to set the behavior of the assistant',
                    placeholder: 'You are a helpful assistant...',
                },
                {
                    displayName: 'Message',
                    name: 'message',
                    type: 'string',
                    typeOptions: {
                        rows: 4,
                    },
                    default: '',
                    description: 'The message to send to the chat model',
                    required: true,
                },
                {
                    displayName: 'Image URL',
                    name: 'imageUrl',
                    type: 'string',
                    default: '',
                    description: 'Optional: Image URL address, supports http/https links or base64 encoding',
                    placeholder: 'https://example.com/image.jpg or data:image/jpeg;base64,...',
                },

                {
                    displayName: 'Temperature',
                    name: 'temperature',
                    type: 'number',
                    default: 0.9,
                    description: 'What sampling temperature to use',
                },
                {
                    displayName: 'Additional Fields',
                    name: 'additionalFields',
                    type: 'collection',
                    placeholder: 'Add Field',
                    default: {},
                    options: [
                        {
                            displayName: 'Frequency Penalty',
                            name: 'frequency_penalty',
                            type: 'number',
                            default: 0,
                            description: 'Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency.',
                        },
                        {
                            displayName: 'Max Tokens',
                            name: 'max_tokens',
                            type: 'number',
                            default: 1000,
                            description: 'The maximum number of tokens to generate',
                        },
                        {
                            displayName: 'Presence Penalty',
                            name: 'presence_penalty',
                            type: 'number',
                            default: 0,
                            description: 'Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far.',
                        },
                        {
                            displayName: 'Top P',
                            name: 'top_p',
                            type: 'number',
                            default: 1,
                            description: 'An alternative to sampling with temperature, called nucleus sampling',
                        },
                    ],
                },
            ],
        };
        this.methods = {
            loadOptions: {
                async getModels() {
                    const credentials = await this.getCredentials('threeZeroTwoAIApi');
                    const options = {
                        url: 'https://api.302.ai/v1/models?llm=1',
                        headers: {
                            Authorization: `Bearer ${credentials.apiKey}`,
                            'Content-Type': 'application/json',
                        },
                        method: 'GET',
                        json: true,
                    };
                    try {
                        const response = await this.helpers.request(options);
                        if (!(response === null || response === void 0 ? void 0 : response.data) || !Array.isArray(response.data)) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Invalid response format from 302.ai API');
                        }
                        const models = response.data
                            .map((model) => ({
                            name: model.id,
                            value: model.id,
                            description: model.owned_by ? `Owned by: ${model.owned_by}` : '',
                        }))
                            .sort((a, b) => a.name.localeCompare(b.name));
                        if (models.length === 0) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'No models found in 302.ai API response');
                        }
                        return models;
                    }
                    catch (error) {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Failed to load models: ${error.message}`);
                    }
                },
            },
        };
    }
    async execute() {
        var _a, _b, _c, _d, _e, _f;
        const items = this.getInputData();
        const returnData = [];
        const credentials = await this.getCredentials('threeZeroTwoAIApi');
        if (!(credentials === null || credentials === void 0 ? void 0 : credentials.apiKey)) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'No valid API key provided');
        }
        for (let i = 0; i < items.length; i++) {
            try {
                const operation = this.getNodeParameter('operation', i);
                const model = this.getNodeParameter('model', i);
                const systemPrompt = this.getNodeParameter('system_prompt', i, '');
                const message = this.getNodeParameter('message', i);
                const temperature = this.getNodeParameter('temperature', i);
                const additionalFields = this.getNodeParameter('additionalFields', i);
                if (operation === 'chat') {
                    const messages = [];
                    if (systemPrompt) {
                        messages.push({
                            role: 'system',
                            content: systemPrompt,
                        });
                    }
                    const imageUrl = this.getNodeParameter("imageUrl", i, "");
                    let userMessage = { role: "user" };
                    
                    if (imageUrl) {
                        // Multimodal format: contains both text and image
                        userMessage.content = [
                            {
                                type: "text",
                                text: message
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: imageUrl
                                }
                            }
                        ];
                    } else {
                        // Text-only format
                        userMessage.content = message;
                    }
                    
                    messages.push(userMessage);
                    const requestBody = {
                        model,
                        messages,
                        temperature,
                        ...additionalFields,
                    };
                    const options = {
                        url: 'https://api.302.ai/v1/chat/completions',
                        headers: {
                            Authorization: `Bearer ${credentials.apiKey}`,
                            'Content-Type': 'application/json',
                        },
                        method: 'POST',
                        body: requestBody,
                        json: true,
                    };
                    const response = await this.helpers.request(options);
                    if (!((_f = (_e = (_d = response === null || response === void 0 ? void 0 : response.choices) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.message) === null || _f === void 0 ? void 0 : _f.content)) {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Invalid response format from 302.ai API');
                    }
                    const typedResponse = response;
                    const messageContent = typedResponse.choices[0].message.content.trim();
                    returnData.push({
                        json: {
                            response: messageContent,
                        },
                        pairedItem: { item: i },
                    });
                }
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({
                        json: {
                            error: error.message,
                        },
                        pairedItem: { item: i },
                    });
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.ThreeZeroTwoAI = ThreeZeroTwoAI;
