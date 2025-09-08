"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThreeZeroTwoAIApi = void 0;
class ThreeZeroTwoAIApi {
    constructor() {
        this.name = 'threeZeroTwoAIApi';
        this.displayName = '302.ai API';
        this.documentationUrl = 'https://302.ai/';
        this.icon = 'file:../icons/aiThreeZeroTwo.svg';
        this.properties = [
            {
                displayName: 'API Key',
                name: 'apiKey',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                default: '',
                required: true,
                description: 'The 302.ai API key for accessing OpenAI services',
            },
        ];
    }
}
exports.ThreeZeroTwoAIApi = ThreeZeroTwoAIApi;
