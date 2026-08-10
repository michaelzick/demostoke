import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

const ROOT = path.resolve(__dirname, "../../");
const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(ROOT, relativePath), "utf-8");

describe("Mixpanel replay privacy", () => {
  const indexSource = readSource("index.html");

  it("shows ordinary page text and enables replay-backed heatmaps", () => {
    expect(indexSource).toMatch(/record_heatmap_data:\s*true/);
    expect(indexSource).toMatch(/record_mask_all_text:\s*false/);
  });

  it("keeps every form input masked without an unmask exception", () => {
    expect(indexSource).toMatch(/record_mask_all_inputs:\s*true/);
    expect(indexSource).not.toMatch(/record_unmask_input_selector/);
  });

  it("redacts displayed profile contact data outside form controls", () => {
    const contactModalSource = readSource(
      "src/components/equipment-detail/ContactInfoModal.tsx",
    );
    const profileSidebarSource = readSource(
      "src/components/profile/UserProfileSidebar.tsx",
    );
    const profileImageSource = readSource(
      "src/components/profile/ProfileImageSection.tsx",
    );

    expect(contactModalSource.match(/className="mp-block/g)).toHaveLength(2);
    expect(profileSidebarSource).toMatch(/className="mp-block[^\"]*"/);
    expect(profileSidebarSource).toMatch(/className="mp-mask[^\"]*"/);
    expect(profileImageSource).toMatch(/className="mp-mask[^\"]*"/);
  });
});
