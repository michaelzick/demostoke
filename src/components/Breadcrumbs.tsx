import { Link } from "react-router-dom";

interface BreadcrumbsProps {
  items: { label: string; path: string }[];
  /**
   * Optional class applied to the last breadcrumb item. Useful for
   * truncating long titles without affecting other breadcrumbs.
   */
  lastItemClassName?: string;
}

const Breadcrumbs = ({ items, lastItemClassName }: BreadcrumbsProps) => {
  return (
    <nav className="text-sm text-muted-foreground mb-4">
      <ul className="flex items-center gap-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <Link
              to={item.path}
              className={`hover:underline ${
                index === items.length - 1 ? lastItemClassName ?? '' : ''
              }`}
            >
              {item.label}
            </Link>
            {index < items.length - 1 && (
              <span className="ml-2">/</span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Breadcrumbs;
