# CLI Images

Easily process images on a file system singly or in bulk through
a friendly and easy-to-use CLI interface. The image processing happens
through lwip (https://github.com/EyalAr/lwip), so reading those docs
might be helpful as well, particularly if you'd like to extend this
module.

## Entry point

bin/process

## Arguments

1. -d or --directory: Directory to process all image files
2. -p or --path: File path to image file to process
3. -o or --operation: A single operation to perform on an image(s). TODO: add all operations
4. -w or --width: The width in pixels that output images will be, where the height will be proportionally calculated. DEFAULT: 1920 (px)
5. -q or --quality: For JPEG images, the output image quality compared to the original (0-100)%

## Examples

~ >node bin/process -p ~/Pictures/DSC_0001.jpg
~ >node bin/process -p ~/Pictures/DSC_0001.jpg -o resize
~ >node bin/process -d ~/Pictures
~ >node bin/process -d ~/Pictures -o resize
~ >node bin/process -d ~/Pictures -o resize -q 50
~ >node bin/process -d ~/Pictures -o resize -q 50 -w 800
