import { FC } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, Loader2, CheckCircle } from "lucide-react";
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
}) => (
  <div className="border rounded-lg">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Preview</TableHead>
          <TableHead>URL</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>File Type</TableHead>
          <TableHead>Gear Detail</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {images.map((image) => {
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
                      e.currentTarget.src = '/img/demostoke-logo-ds-transparent-cropped.webp';
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
                <Badge variant="outline">
                  {getSourceDisplayName(image.source_table, image.source_column)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{image.file_type || 'UNKNOWN'}</Badge>
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
                      'Download'
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

export default ImageResultsTable;
