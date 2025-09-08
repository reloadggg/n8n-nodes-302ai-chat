"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatFields = exports.chatOperations = void 0;
exports.chatOperations = [
    {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['chat'],
            },
        },
        options: [
            {
                name: 'Complete',
                value: 'complete',
                action: 'Create a Completion',
                description: 'Create a chat completion using 302.ai OpenAI proxy',
                routing: {
                    request: {
                        method: 'POST',
                        url: '/v1/chat/completions',
                    },
                },
            },
        ],
        default: 'complete',
    },
];
exports.chatFields = [
    {
        displayName: 'Model',
        name: 'model',
        type: 'string',
        description: 'The model to use for completion',
        displayOptions: {
            show: {
                operation: ['complete'],
                resource: ['chat'],
            },
        },
        routing: {
            send: {
                type: 'body',
                property: 'model',
            },
        },
        default: 'gpt-3.5-turbo',
    },
    {
        displayName: 'Messages',
        name: 'messages',
        type: 'fixedCollection',
        typeOptions: {
            multipleValues: true,
        },
        displayOptions: {
            show: {
                resource: ['chat'],
                operation: ['complete'],
            },
        },
        placeholder: 'Add Message',
        default: {
            messages: [
                {
                    role: 'user',
                    content: '',
                },
            ],
        },
        options: [
            {
                displayName: 'Messages',
                name: 'messages',
                values: [
                    {
                        displayName: 'Role',
                        name: 'role',
                        type: 'options',
                        options: [
                            {
                                name: 'Assistant',
                                value: 'assistant',
                            },
                            {
                                name: 'System',
                                value: 'system',
                            },
                            {
                                name: 'User',
                                value: 'user',
                            },
                        ],
                        default: 'user',
                    },
                    {
                        displayName: 'Content',
                        name: 'content',
                        type: 'string',
                        typeOptions: {
                            rows: 2,
                        },
                        default: '',
                        description: 'The content of the message',
                    },
                ],
            },
        ],
        routing: {
            send: {
                type: 'body',
                property: 'messages',
            },
        },
    },
    {
        displayName: 'Temperature',
        name: 'temperature',
        type: 'number',
        description: 'Controls randomness in the response',
        displayOptions: {
            show: {
                operation: ['complete'],
                resource: ['chat'],
            },
        },
        typeOptions: {
            minValue: 0,
            maxValue: 2,
        },
        routing: {
            send: {
                type: 'body',
                property: 'temperature',
            },
        },
        default: 1,
    },
    {
        displayName: 'Max Tokens',
        name: 'max_tokens',
        type: 'number',
        description: 'The maximum number of tokens to generate',
        displayOptions: {
            show: {
                operation: ['complete'],
                resource: ['chat'],
            },
        },
        routing: {
            send: {
                type: 'body',
                property: 'max_tokens',
            },
        },
        default: 16,
    },
];
