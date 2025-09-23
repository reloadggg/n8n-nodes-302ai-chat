import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	INodePropertyOptions,
	IRequestOptions,
} from "n8n-workflow";
import { NodeConnectionType, NodeOperationError } from "n8n-workflow";

interface ThreeZeroTwoModel {
	id: string;
	owned_by?: string;
}

interface ChatCompletionResponse {
	choices?: Array<{
		message?: {
			content?: string;
		};
	}>;
}

type MultimodalMessageContent =
	| string
	| Array<
		{
			type: "text";
			text: string;
		}
		|
		{
			type: "image_url";
			image_url: {
				url: string;
			};
		}
	>;

interface StreamDelta {
	content?: string | null;
	reasoning_content?: string | null;
}

interface StreamChoice {
	delta?: StreamDelta;
	finish_reason?: string | null;
}

interface StreamChunk {
	choices?: StreamChoice[];
}

function parseStreamChunks(raw: string): { content: string; reasoning: string } {
	const contentParts: string[] = [];
	const reasoningParts: string[] = [];

	for (const line of raw.split(/\r?\n/)) {
		const trimmed = line.trim();

		if (!trimmed || !trimmed.startsWith("data:")) {
			continue;
		}

		const payload = trimmed.slice(5).trim();

		if (!payload || payload === "[DONE]") {
			continue;
		}

		try {
			const parsed = JSON.parse(payload) as StreamChunk;
			const delta = parsed.choices?.[0]?.delta;

			if (typeof delta?.content === "string") {
				contentParts.push(delta.content);
			}

			if (typeof delta?.reasoning_content === "string") {
				reasoningParts.push(delta.reasoning_content);
			}
		} catch (error) {
			continue;
		}
	}

	return {
		content: contentParts.join(""),
		reasoning: reasoningParts.join(""),
	};
}

export class ThreeZeroTwoAi implements INodeType {
	description: INodeTypeDescription = {
		displayName: "302.AI",
		name: "threeZeroTwoAi",
		icon: { light: "file:aiThreeZeroTwo.svg", dark: "file:aiThreeZeroTwo.svg" },
		group: ["transform"],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: "Interact with 302.AI AI services",
		defaults: {
			name: "302.AI",
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: "threeZeroTwoAIApi",
				required: true,
			},
		],
		properties: [
			{
				displayName: "Operation",
				name: "operation",
				type: "options",
				noDataExpression: true,
				options: [
					{
						name: "Chat",
						value: "chat",
						description: "Send a chat message",
						action: "Send a chat message",
					},
				],
				default: "chat",
			},
			{
				displayName: "Model Name or ID",
				name: "model",
				type: "options",
				noDataExpression: true,
				typeOptions: {
					loadOptionsMethod: "getModels",
				},
				required: true,
				default: "",
				description:
					"Choose from the list, or specify an ID using an <a href=\"https://docs.n8n.io/code/expressions/\">expression</a>",
			},
			{
				displayName: "System Prompt",
				name: "system_prompt",
				type: "string",
				typeOptions: {
					rows: 4,
				},
				default: "",
				description: "System message to set the behavior of the assistant",
				placeholder: "You are a helpful assistant...",
			},
			{
				displayName: "Message",
				name: "message",
				type: "string",
				typeOptions: {
					rows: 4,
				},
				default: "",
				description: "The message to send to the chat model",
				required: true,
			},
			{
				displayName: "Image URL",
				name: "imageUrl",
				type: "string",
				default: "",
				description:
					"Optional image URL. Supports http/https links or base64-encoded data URLs.",
				placeholder: "https://example.com/image.jpg or data:image/jpeg;base64,...",
			},
			{
				displayName: "Pseudo-Stream Mode",
				name: "pseudoStream",
				type: "boolean",
				default: false,
				description:
					"Whether to enable Pseudo-Stream Mode for models that only support streaming responses (e.g. Qwen3). The node consumes the stream and returns the final answer.",
			},
			{
				displayName: "Temperature",
				name: "temperature",
				type: "number",
				default: 0.9,
				description: "Sampling temperature to use for the chat completion",
			},
			{
				displayName: "Additional Fields",
				name: "additionalFields",
				type: "collection",
				placeholder: "Add Field",
				default: {},
				options: [
					{
						displayName: "Frequency Penalty",
						name: "frequency_penalty",
						type: "number",
						default: 0,
						description:
							"Number between -2.0 and 2.0. Positive values penalize frequent tokens.",
					},
					{
						displayName: "Max Tokens",
						name: "max_tokens",
						type: "number",
						default: 1000,
						description: "Maximum number of tokens to generate in the response",
					},
					{
						displayName: "Presence Penalty",
						name: "presence_penalty",
						type: "number",
						default: 0,
						description:
							"Number between -2.0 and 2.0. Positive values penalize novel tokens.",
					},
					{
						displayName: "Top P",
						name: "top_p",
						type: "number",
						default: 1,
						description: "Alternative to temperature sampling using nucleus sampling",
					},
				],
			},
		],
	};

	methods = {
		loadOptions: {
			async getModels(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const credentials = await this.getCredentials("threeZeroTwoAIApi");
				if (!credentials?.apiKey) {
					throw new NodeOperationError(this.getNode(), "API key is required to load models");
				}

				const requestOptions: IRequestOptions = {
					url: "https://api.302.ai/v1/models?llm=1",
					headers: {
						Authorization: `Bearer ${credentials.apiKey}`,
						"Content-Type": "application/json",
					},
					method: "GET",
					json: true,
				};

				try {
					const response = (await this.helpers.request(requestOptions)) as {
						data?: ThreeZeroTwoModel[];
					};

					if (!Array.isArray(response?.data)) {
						throw new NodeOperationError(this.getNode(), "Invalid response format from 302.AI API");
					}

					const models = response.data
						.map<INodePropertyOptions>((model) => ({
							name: model.id,
							value: model.id,
							description: model.owned_by ? `Owned by: ${model.owned_by}` : undefined,
						}))
						.sort((a, b) => a.name.localeCompare(b.name));

					if (models.length === 0) {
						throw new NodeOperationError(this.getNode(), "No models found in 302.AI API response");
					}

					return models;
				} catch (error) {
					const message = error instanceof Error ? error.message : "Unknown error";
					throw new NodeOperationError(this.getNode(), `Failed to load models: ${message}`);
				}
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const credentials = await this.getCredentials("threeZeroTwoAIApi");

		if (!credentials?.apiKey) {
			throw new NodeOperationError(this.getNode(), "No valid API key provided");
		}

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const operation = this.getNodeParameter("operation", itemIndex) as string;

				if (operation !== "chat") {
					throw new NodeOperationError(this.getNode(), `Unsupported operation: ${operation}`);
				}

				const model = this.getNodeParameter("model", itemIndex) as string;
				const systemPrompt = this.getNodeParameter("system_prompt", itemIndex, "") as string;
				const message = this.getNodeParameter("message", itemIndex) as string;
				const temperature = this.getNodeParameter("temperature", itemIndex) as number;
				const additionalFields = this.getNodeParameter("additionalFields", itemIndex, {}) as IDataObject;
				const imageUrl = this.getNodeParameter("imageUrl", itemIndex, "") as string;
				const pseudoStream = this.getNodeParameter("pseudoStream", itemIndex, false) as boolean;

				const messages: Array<{ role: string; content: MultimodalMessageContent }> = [];

				if (systemPrompt) {
					messages.push({
						role: "system",
						content: systemPrompt,
					});
				}

				const userMessage: { role: "user"; content: MultimodalMessageContent } = {
					role: "user",
					content: message,
				};

				if (imageUrl) {
					userMessage.content = [
						{ type: "text", text: message },
						{ type: "image_url", image_url: { url: imageUrl } },
					];
				}

				messages.push(userMessage);

				const requestBody: IDataObject = {
					model,
					messages,
					temperature,
					...additionalFields,
				};

				const baseHeaders: Record<string, string> = {
					Authorization: `Bearer ${credentials.apiKey}`,
					"Content-Type": "application/json",
				};

				const baseRequestOptions: IRequestOptions = {
					url: "https://api.302.ai/v1/chat/completions",
					method: "POST",
					headers: baseHeaders,
				};

				let messageContent: string | undefined;
				let reasoningContent = "";

				if (pseudoStream) {
					requestBody.stream = true;

					const streamOptions: IRequestOptions = {
						...baseRequestOptions,
						headers: {
							...baseHeaders,
							Accept: "text/event-stream",
						},
						body: JSON.stringify(requestBody),
						json: false,
					};

					const rawStream = (await this.helpers.request(streamOptions)) as string;
					const aggregated = parseStreamChunks(rawStream);
					messageContent = aggregated.content.trim();
					reasoningContent = aggregated.reasoning.trim();

					if (!messageContent && reasoningContent) {
						messageContent = reasoningContent;
					}
				} else {
					const standardResponse = (await this.helpers.request({
						...baseRequestOptions,
						body: requestBody,
						json: true,
					})) as ChatCompletionResponse;

					messageContent = standardResponse?.choices?.[0]?.message?.content?.trim();
				}

				if (!messageContent) {
					throw new NodeOperationError(this.getNode(), "Invalid response format from 302.AI API");
				}

				const output: IDataObject = { response: messageContent };

				if (reasoningContent) {
					output.reasoning = reasoningContent;
				}

				returnData.push({
					json: output,
					pairedItem: { item: itemIndex },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					const message = error instanceof Error ? error.message : "Unknown error";

					returnData.push({
						json: {
							error: message,
						},
						pairedItem: { item: itemIndex },
					});

					continue;
				}

				throw error;
			}
		}

		return [returnData];
	}
}

export { ThreeZeroTwoAi as ThreeZeroTwoAI };

