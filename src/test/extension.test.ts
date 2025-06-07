import * as assert from 'assert';
import { countErrorsByType } from '../utils/fileUtils';
import { LinterError } from '../types/types';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});
});

suite('Utils Test Suite', () => {
    test('countErrorsByType should count errors correctly', () => {

        const errors: LinterError[] = [
            { type: 'Error', row: 1, message: 'Error 1' },
            { type: 'Warning', row: 2, message: 'Warning 1' },
            { type: 'Info', row: 3, message: 'Info 1' },
            { type: 'Error', row: 4, message: 'Error 2' },
        ];
        const result = countErrorsByType(errors);
        assert.strictEqual(result.Error, 2);
        assert.strictEqual(result.Warning, 1);
        assert.strictEqual(result.Info, 1);
        assert.strictEqual(result.Total, 4);
    });
});
