# Image Optimization Implementation

This document describes the image optimization implementation for the Common Elements platform.

## Overview

All images in the application now use Next.js Image component for automatic optimization, lazy loading, and responsive sizing. This improves performance, reduces bandwidth usage, and provides better user experience.

## Configuration

### next.config.js

Image optimization is configured in `apps/web/next.config.js`:

```javascript
images: {
  // Modern image formats for better compression
  formats: ['image/avif', 'image/webp'],
  
  // Device sizes for responsive images
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  
  // Image sizes for different use cases
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  
  // Cache optimized images for 60 seconds
  minimumCacheTTL: 60,
  
  // Allow Supabase storage URLs
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**.supabase.co',
      pathname: '/storage/v1/object/public/**',
    },
  ],
}
```

### Key Features

1. **Modern Formats**: Automatically serves AVIF and WebP formats when supported by the browser
2. **Responsive Images**: Generates multiple sizes based on device and viewport
3. **Remote Patterns**: Configured to allow Supabase storage URLs
4. **Caching**: Optimized images are cached for better performance

## Implementation Details

### UserBadge Component

**Location**: `packages/ui/src/user-badge.tsx`

**Changes**:
- Replaced `<img>` with Next.js `Image` component
- Added `fill` prop for responsive sizing within container
- Configured `sizes` prop based on badge size (sm: 32px, md: 40px, lg: 48px)
- Set `priority={false}` for lazy loading (avatars are typically below the fold)
- Added `relative` positioning to parent container for `fill` to work

**Example**:
```tsx
<Image
  src={user.avatarUrl}
  alt={user.name}
  fill
  sizes={
    size === 'sm' ? '32px' :
    size === 'md' ? '40px' :
    '48px'
  }
  className="object-cover"
  priority={false}
/>
```

### AvatarUpload Component

**Location**: `apps/web/src/app/(platform)/profile/edit/avatar-upload.tsx`

**Changes**:
- Uses Next.js `Image` for uploaded avatar URLs
- Keeps regular `<img>` for base64 preview URLs (Next.js Image doesn't support data URLs)
- Added conditional rendering based on URL type
- Set `priority={true}` since avatar is above the fold on profile edit page
- Configured `sizes="96px"` for the 96x96 avatar preview

**Example**:
```tsx
{previewUrl.startsWith('data:') ? (
  // Base64 preview - use regular img
  <img src={previewUrl} alt={userName} className="h-full w-full object-cover" />
) : (
  // Uploaded URL - use Next.js Image
  <Image
    src={previewUrl}
    alt={userName}
    fill
    sizes="96px"
    className="object-cover"
    priority
  />
)}
```

## Performance Benefits

### Automatic Optimization
- **Format Conversion**: Serves AVIF (up to 50% smaller) or WebP (up to 30% smaller) when supported
- **Compression**: Automatically compresses images without quality loss
- **Resizing**: Generates optimal sizes for different devices and viewports

### Lazy Loading
- Images load only when they enter the viewport
- Reduces initial page load time
- Saves bandwidth for users who don't scroll to all images

### Responsive Images
- Serves appropriate image size based on device
- Mobile devices get smaller images (faster loading)
- Desktop devices get higher resolution images
- Reduces unnecessary data transfer

### Caching
- Optimized images are cached on CDN
- Subsequent loads are instant
- Reduces server load and bandwidth costs

## Best Practices

### When to Use `priority`
- **Use `priority={true}`**: For above-the-fold images (hero images, profile avatars on profile pages)
- **Use `priority={false}`**: For below-the-fold images (list items, comments, forum posts)

### Sizing Guidelines
- Always specify `sizes` prop for responsive images
- Use `fill` for images that should fill their container
- Specify exact dimensions when size is known

### Remote Images
- All Supabase storage URLs are allowed via `remotePatterns`
- Add additional domains to `remotePatterns` if needed
- Never use external URLs without configuring them first

## Testing

### Visual Testing
1. Check that all avatars display correctly
2. Verify images load progressively
3. Test on different screen sizes
4. Confirm lazy loading works (images load as you scroll)

### Performance Testing
1. Use Chrome DevTools Network tab to verify:
   - Images are served in WebP/AVIF format
   - Correct image sizes are loaded for viewport
   - Images are lazy loaded
2. Use Lighthouse to verify improved performance scores

### Browser Testing
- Test in Chrome (AVIF support)
- Test in Safari (WebP support)
- Test in Firefox (both formats)
- Verify fallback to JPEG/PNG works

## Future Enhancements

### Potential Improvements
1. **Blur Placeholder**: Add blur placeholders for better perceived performance
2. **Image Sprites**: Consider sprites for small icons
3. **CDN Integration**: Optimize CDN caching strategy
4. **Progressive Loading**: Implement progressive image loading for large images

### Additional Optimization Opportunities
- RFP attachment thumbnails (if images)
- Forum post embedded images (future feature)
- Vendor portfolio images (future feature)

## Troubleshooting

### Common Issues

**Issue**: Images not loading
- **Solution**: Check that domain is in `remotePatterns` in next.config.js

**Issue**: Images appear blurry
- **Solution**: Verify `sizes` prop matches actual rendered size

**Issue**: Slow image loading
- **Solution**: Check network tab for image size, adjust `sizes` prop if too large

**Issue**: Build errors with Image component
- **Solution**: Ensure `next/image` is imported, not `next/legacy/image`

## Related Files

- `apps/web/next.config.js` - Image optimization configuration
- `packages/ui/src/user-badge.tsx` - UserBadge component with optimized images
- `apps/web/src/app/(platform)/profile/edit/avatar-upload.tsx` - Avatar upload with optimized preview

## References

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Next.js Image Component API](https://nextjs.org/docs/app/api-reference/components/image)
- [Image Optimization Best Practices](https://web.dev/fast/#optimize-your-images)
