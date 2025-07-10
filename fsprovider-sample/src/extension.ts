import * as vscode from 'vscode';
import { MemFS } from './fileSystemProvider';

export function activate(context: vscode.ExtensionContext) {

	console.log('MemFS says "Hello"');

	const memFs = new MemFS();
	context.subscriptions.push(vscode.workspace.registerFileSystemProvider('memfs', memFs, { isCaseSensitive: true }));
	let initialized = false;

	context.subscriptions.push(vscode.commands.registerCommand('memfs.reset', _ => {
		for (const [name] of memFs.readDirectory(vscode.Uri.parse('memfs:/'))) {
			memFs.delete(vscode.Uri.parse(`memfs:/${name}`));
		}
		initialized = false;
	}));

	context.subscriptions.push(vscode.commands.registerCommand('memfs.addFile', _ => {
		if (initialized) {
			memFs.writeFile(vscode.Uri.parse(`memfs:/file.txt`), Buffer.from('foo'), { create: true, overwrite: true });
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('memfs.deleteFile', _ => {
		if (initialized) {
			memFs.delete(vscode.Uri.parse('memfs:/file.txt'));
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('memfs.init', _ => {
		if (initialized) {
			return;
		}
		initialized = true;

		// most common files types
		memFs.writeFile(vscode.Uri.parse(`memfs:/README.md`), Buffer.from('Empty project'), { create: true, overwrite: true });

		// Create a cursor rule
		memFs.createDirectory(vscode.Uri.parse(`memfs:/.cursor/`));
		memFs.createDirectory(vscode.Uri.parse(`memfs:/.cursor/rules`));

		const dear_majesty_rule = `---
alwaysApply: true
---
Begin every message to the user with the phrase "Dear Majesty".
`;
		memFs.writeFile(vscode.Uri.parse(`memfs:/.cursor/rules/dear_majesty.mdc`), Buffer.from(dear_majesty_rule), { create: true, overwrite: true });
	}));

	context.subscriptions.push(vscode.commands.registerCommand('memfs.workspaceInit', _ => {
		vscode.workspace.updateWorkspaceFolders(0, 0, { uri: vscode.Uri.parse('memfs:/'), name: "MemFS - Sample" });
	}));
}
