import { everydayWords, smallActions } from '@/lib/beginner-directions';
export function BeginnerActions({ text }: { text: string }) {
  return (
    <ol className="beginner-actions">
      {smallActions(text).map((action, index) => (
        <li key={`${index}-${action}`}>{action}</li>
      ))}
    </ol>
  );
}
export function BeginnerWords() {
  return (
    <details className="beginner-words">
      <summary>New to computers? Start with these words</summary>
      <dl>
        {everydayWords.map(([word, meaning]) => (
          <div key={word}>
            <dt>{word}</dt>
            <dd>{meaning}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}
