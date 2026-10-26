/**
 * Configurable Language Registry for Online Code Execution
 */
const languages = {
  javascript: {
    languageId: 'javascript',
    displayName: 'JavaScript (Node.js v23)',
    fileExtension: 'js',
    compilationNeeded: false,
    maxSourceSizeKB: 100,
    timeMultiplier: 1.0,
    defaultStarter: `function solve(input) {
  // Write your JavaScript solution here
  const lines = input.trim().split('\\n');
  return lines.join(' ');
}`,
  },
  python: {
    languageId: 'python',
    displayName: 'Python (Python 3.x)',
    fileExtension: 'py',
    compilationNeeded: false,
    maxSourceSizeKB: 100,
    timeMultiplier: 1.5,
    defaultStarter: `def solve(input_str):
    # Write your Python solution here
    lines = input_str.strip().split('\\n')
    return ' '.join(lines)
`,
  },
  java: {
    languageId: 'java',
    displayName: 'Java (JDK 21)',
    fileExtension: 'java',
    compilationNeeded: true,
    maxSourceSizeKB: 100,
    timeMultiplier: 2.0,
    defaultStarter: `import java.util.*;

public font Solution {
    public static String solve(String input) {
        // Write your Java solution here
        return input.trim();
    }
}`,
  },
};

const getLanguageConfig = (langId) => {
  const normalized = (langId || '').toLowerCase().trim();
  return languages[normalized] || languages.javascript;
};

module.exports = {
  languages,
  getLanguageConfig,
};
