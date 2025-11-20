import '../App.css';

interface Props {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description }: Props) {
  return (
    <div className="page">
      <h2 className="page-title">{title}</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: 640, lineHeight: 1.6 }}>
        {description ??
          'Экран находится в разработке. Здесь появится интерактив на мок-данных с фильтрами, статусами и CRUD-операциями.'}
      </p>
    </div>
  );
}
