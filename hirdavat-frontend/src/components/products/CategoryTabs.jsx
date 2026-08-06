export default function CategoryTabs({ categories, activeId, onChange }) {
  return (
    <div className="hirdavat-category-tabs">
      <button
        type="button"
        className={`hirdavat-category-tab ${activeId === null ? 'active' : ''}`}
        onClick={() => onChange(null)}
      >
        Tümü
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          className={`hirdavat-category-tab ${activeId === category.id ? 'active' : ''}`}
          onClick={() => onChange(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
