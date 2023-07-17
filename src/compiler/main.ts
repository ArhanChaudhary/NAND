import Tokenizer, { TokenType } from "./tokenizer";
import Engine from "./engine";
import fs from "fs";

let path: string = process.argv[process.argv.length - 1];
if (path[path.length - 1] === '/') {
    path = path.slice(0, -1);
}

let files: string[];
if (path.endsWith('.jack')) {
    files = [path];
} else {
    files = fs.readdirSync(path).map(file => `${path}/${file}`);
}
files.forEach(file => {
    if (!file.endsWith('.jack')) return;
    
    const tokenizer: Tokenizer = new Tokenizer(file);
    while (tokenizer.advance()) {
        switch (tokenizer.tokenType()) {
            case TokenType.KEYWORD:
                tokenizer.writeXML('keyword', tokenizer.token());
                break;
            case TokenType.SYMBOL:
                tokenizer.writeXML('symbol', tokenizer.token());
                break;
            case TokenType.IDENTIFIER:
                tokenizer.writeXML('identifier', tokenizer.token());
                break;
            case TokenType.INT_CONST:
                tokenizer.writeXML('integerConstant', tokenizer.token());
                break;
            case TokenType.STRING_CONST:
                tokenizer.writeXML('stringConstant', tokenizer.token());
                break;
        }
    }
});