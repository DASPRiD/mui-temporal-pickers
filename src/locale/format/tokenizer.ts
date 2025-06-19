import { knownTokens, type Token } from "./tokens.js";

export type ParsedToken =
    | {
          type: "literal";
          value: string;
      }
    | {
          type: "token";
          value: Token;
      };

const tokensSorted = knownTokens.slice().sort((a, b) => b.length - a.length);

const readQuotedLiteral = (
    input: string,
    startIndex: number,
): { value: string; endIndex: number } => {
    let value = "";
    let i = startIndex;

    while (i < input.length) {
        if (input[i] === "'") {
            if (input[i + 1] === "'") {
                value += "'";
                i += 2;
            } else {
                i++;
                break;
            }
        } else {
            value += input[i];
            i++;
        }
    }

    return { value, endIndex: i };
};

const matchToken = (input: string, startIndex: number): string | null => {
    for (const token of tokensSorted) {
        if (input.startsWith(token, startIndex)) {
            return token;
        }
    }

    return null;
};

const readUnquotedLiteral = (
    input: string,
    startIndex: number,
): { value: string; endIndex: number } => {
    let value = "";
    let i = startIndex;

    while (i < input.length) {
        if (input[i] === "'") {
            break;
        }

        const token = matchToken(input, i);

        if (token) {
            break;
        }

        if (input[i] === "'" && input[i + 1] === "'") {
            value += "'";
            i += 2;
        } else {
            value += input[i];
            i++;
        }
    }

    return { value, endIndex: i };
};

const parseCache = new Map<string, ParsedToken[]>();

export const parseTokenString = (input: string): ParsedToken[] => {
    const cached = parseCache.get(input);

    if (cached) {
        return cached;
    }

    const results: ParsedToken[] = [];
    let i = 0;

    while (i < input.length) {
        if (input[i] === "'") {
            const { value, endIndex } = readQuotedLiteral(input, i + 1);

            results.push({ type: "literal", value });
            i = endIndex;
        } else {
            const token = matchToken(input, i);

            if (token) {
                results.push({ type: "token", value: token as Token });
                i += token.length;
            } else {
                const { value, endIndex } = readUnquotedLiteral(input, i);
                results.push({ type: "literal", value });
                i = endIndex;
            }
        }
    }

    parseCache.set(input, results);
    return results;
};
