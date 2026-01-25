
## Fix: Duplicate Blog Post Creation

### Problem Analysis
When creating a blog post in `BlogCreatePage.tsx`, two database entries are created:

1. **Auto-save** runs every 30 seconds and creates a draft via `blogService.saveDraft()` (inserts new row with `status: 'draft'`)
2. **Publish action** (`handleCreatePost`) then:
   - Calls `blogService.createPost()` → inserts a **second** row
   - If `draftId` exists, also calls `blogService.publishDraft()` → updates the first draft

This results in 2 posts: one new "published" post AND the original draft (which may also get published).

### Solution
Modify `handleCreatePost` in `BlogCreatePage.tsx` to:
- If a draft exists (`draftId` is set): **update and publish the existing draft** instead of creating a new post
- If no draft exists: create a new post as before

### Technical Changes

**File: `src/pages/BlogCreatePage.tsx`**

Modify the `handleCreatePost` function (around lines 146-234):

```typescript
const handleCreatePost = async () => {
  if (!isFormValid()) {
    toast.error("Please fill in all required fields.");
    return;
  }

  if (!user?.id) {
    toast.error("You must be logged in to publish posts.");
    return;
  }

  setIsCreating(true);
  try {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const readTime = Math.ceil(content.split(' ').length / 200);

    // Prepare image URLs
    const heroImg = imageUrl.trim();
    const thumbImg = thumbnailUrl.trim();

    let finalThumbnail = '';
    if (useYoutubeThumbnail && youtubeUrl) {
      const youtubeId = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
      if (youtubeId) {
        finalThumbnail = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
      }
    } else if (thumbImg) {
      finalThumbnail = thumbImg;
    } else if (heroImg) {
      finalThumbnail = heroImg;
    }

    const finalHeroImage = heroImg || finalThumbnail;
    const formattedCategory = category.replace(/-/g, " ");
    const authorSlug = slugify(author.trim());

    // If we have an existing draft, update and publish it
    // Otherwise, create a new post
    if (draftId) {
      // Update the existing draft with all the data
      await blogService.saveDraft({
        id: draftId,
        userId: user.id,
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        category: formattedCategory,
        author: author.trim(),
        authorId: authorSlug,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        heroImage: finalHeroImage,
        thumbnail: finalThumbnail,
        videoEmbed: youtubeUrl || '',
      });

      // Now publish the draft with slug
      await blogService.publishDraft(draftId, readTime, title.trim());
    } else {
      // No draft exists, create a new post directly
      const postData = {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        category: formattedCategory,
        author: author.trim(),
        authorId: authorSlug,
        slug,
        readTime,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        heroImage: finalHeroImage,
        thumbnail: finalThumbnail,
        videoEmbed: youtubeUrl || '',
        publishedAt: publishedDate!.toISOString(),
      };

      await blogService.createPost(postData);
    }

    setCreatedSlug(slug);
    toast.success("Blog post published successfully!");

    // Reset form
    setPrompt("");
    setCategory("");
    setAuthor("");
    setTags("");
    setImageUrl("");
    setThumbnailUrl("");
    setYoutubeUrl("");
    setPublishedDate(undefined);
    setTitle("");
    setExcerpt("");
    setContent("");
    setUseYoutubeThumbnail(false);
    setUseHeroImage(false);
    setDraftId(null);
  } catch (error) {
    console.error("Error creating blog post:", error);
    toast.error("Failed to create blog post. Please try again.");
  } finally {
    setIsCreating(false);
  }
};
```

### Key Changes Summary

| Before | After |
|--------|-------|
| Always calls `createPost()` + optionally `publishDraft()` | Checks if `draftId` exists first |
| Creates 2 rows when auto-save has run | Updates existing draft and publishes it |
| `publishDraft()` called separately | Uses `saveDraft()` to update, then `publishDraft()` |

### Files Changed

| Action | File |
|--------|------|
| MODIFY | `src/pages/BlogCreatePage.tsx` (lines 146-234) |

### Impact
- **Fixes duplicate post creation**: Only 1 post will be created per publish action
- **Preserves auto-save functionality**: Drafts still work correctly
- **No breaking changes**: Existing drafts will still publish correctly
