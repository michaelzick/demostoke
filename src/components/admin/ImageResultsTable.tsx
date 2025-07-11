import { FC, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ExternalLink,
  Loader2,
  CheckCircle,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { ImageRecord } from "./ImageConversionSection";

interface Props {
  images: ImageRecord[];
  converting: Set<string>;
  processImage: (image: ImageRecord) => void;
  getGearDetailLink: (image: ImageRecord) => string | null;
  getSourceDisplayName: (table: string, column: string) => string;
}

const ImageResultsTable: FC<Props> = ({
  images,
  converting,
  processImage,
  getGearDetailLink,
  getSourceDisplayName,
}) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const sortedImages = useMemo(() => {
    if (!sortColumn) return images;
    const sorted = [...images].sort((a, b) => {
      const getValue = (img: ImageRecord) => {
        switch (sortColumn) {
          case "preview":
            return img.url;
          case "url":
            return img.url;
          case "source":
            return getSourceDisplayName(img.source_table, img.source_column);
          case "file_type":
            return img.file_type || "";
          case "gear":
            return getGearDetailLink(img) || "";
          default:
            return "";
        }
      };
      const aVal = getValue(a) ?? "";
      const bVal = getValue(b) ?? "";
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [
    images,
    sortColumn,
    sortDirection,
    getSourceDisplayName,
    getGearDetailLink,
  ]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (column: string) => {
    if (sortColumn !== column) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-3 w-3 inline" />
    ) : (
      <ChevronDown className="h-3 w-3 inline" />
    );
  };

  const getSourceBadgeClass = (table: string, column: string) => {
    const key = `${table}.${column}`;
    if (key === "equipment.image_url") return "bg-rose-500 text-white";
    if (key === "equipment_images.image_url")
      return "bg-lime-300 text-gray-900";
    return "bg-secondary text-secondary-foreground";
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("preview")}
            >
              Preview {renderSortIcon("preview")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("url")}
            >
              URL {renderSortIcon("url")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("source")}
            >
              Source {renderSortIcon("source")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("file_type")}
            >
              File Type {renderSortIcon("file_type")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("gear")}
            >
              Gear Detail {renderSortIcon("gear")}
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedImages.map((image) => {
            const gearDetailLink = getGearDetailLink(image);
            return (
              <TableRow key={image.id}>
                <TableCell>
                  <div className="flex flex-col items-center">
                    <img
                      src={image.url}
                      alt="Preview"
                      className="h-16 w-16 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.src =
                          "/img/demostoke-logo-ds-transparent-cropped.webp";
                      }}
                    />
                    {image.dimensions && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {image.dimensions.width} × {image.dimensions.height}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs">
                  <a
                    href={image.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                    title={image.url}
                  >
                    <div className="truncate">{image.url}</div>
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </TableCell>
                <TableCell>
                  <Badge
                    className={getSourceBadgeClass(
                      image.source_table,
                      image.source_column,
                    )}
                  >
                    {getSourceDisplayName(
                      image.source_table,
                      image.source_column,
                    )}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {image.file_type || "UNKNOWN"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {gearDetailLink ? (
                    <a
                      href={gearDetailLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View Gear
                    </a>
                  ) : (
                    <span className="text-muted-foreground">N/A</span>
                  )}
                </TableCell>
                <TableCell>
                  {image.already_processed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => processImage(image)}
                      disabled={converting.has(image.id)}
                    >
                      {converting.has(image.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Download"
                      )}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default ImageResultsTable;
