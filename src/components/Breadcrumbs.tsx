import { Link } from "react-router-dom";

interface BreadcrumbsProps {
  items: { label: string; path: string }[];
}

const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <nav className="text-sm text-muted-foreground mb-4">
      <ul className="flex items-center gap-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <Link to={item.path} className="hover:underline">
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
