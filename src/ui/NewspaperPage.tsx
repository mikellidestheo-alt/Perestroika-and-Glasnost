import type { Issue } from '../game/types';
import { RichText } from './RichText';

/** One full newspaper page: masthead, headline, article and the voices of different groups. */
export function NewspaperPage({ issue }: { issue: Issue }) {
  const { paper } = issue;
  return (
    <article className="np">
      <div className="np-top">
        <span>{paper.paper === 'Правда' ? 'Орган ЦК КПСС' : 'Известия Советов народных депутатов СССР'}</span>
        <span>{issue.date}</span>
        <span>Цена 5 коп.</span>
      </div>
      <div className="masthead">{paper.paper.toUpperCase()}</div>
      <h2 className="headline">{paper.headline}</h2>
      <p className="deck">{paper.sub}</p>
      <p className="np-lead">
        <RichText text={paper.lead} />
      </p>
      <h3 className="np-voices-title">Что говорят в стране</h3>
      <div className="np-voices">
        {paper.reactions.map((r) => (
          <blockquote key={r.who}>
            <p>«{r.text}»</p>
            <footer>– {r.who}</footer>
          </blockquote>
        ))}
      </div>
    </article>
  );
}
