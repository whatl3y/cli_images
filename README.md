# CLI Images

Easily process images on a file system one-by-one or in bulk if the
images live in a directory through a friendly and easy-to-use CLI interface.
The image processing happens through lwip (https://github.com/EyalAr/lwip), so reading those docs might be helpful as well, particularly if you'd
like to extend this project.

## Entry point

bin/process.js

## Arguments

1. -d or --directory: Input directory to process all image files
2. -p or --path: File path to image file to process
  * Either -d or -p **must** be provided
3. -c or --command: A single command to perform on an image(s). This argument
can be chained in the command line to perform multiple actions collectively
on images. See *Example Executions* below for more details.
DEFAULT: perform all commands individually
  * *warning: omitting -c could take a while and use a lot of CPU if you are processing a directory with a lot of images and/or large images*
4. -w or --width: The width in pixels that output images will be, where
the height will be proportionally calculated. DEFAULT: 1920 (px)
5. -q or --quality: For JPEG images, the output image quality (in percentage) compared to the original, 0-100. DEFAULT: 50 (%)
6. -o or --out: the output directory to place the created and processed files

## Example Executions

- ~>node bin/process -p ~/Pictures/DSC_0001.jpg
- ~>node bin/process -p ~/Pictures/DSC_0001.jpg -c resize -o ~/Pictures/processed
- ~>node bin/process -d ~/Pictures
- ~>node bin/process -d ~/Pictures -o ~/Pictures/processed
- ~>node bin/process -d ~/Pictures -c resize
- ~>node bin/process -d ~/Pictures -c resize -q 50
- ~>node bin/process -d ~/Pictures -c resize -q 25 -w 800
- ~>node bin/process -d ~/Pictures -c resize -c lightenBy40 -c rotate180

## Operations

resize
sharpenBy20
sharpenBy40
sharpenBy60
lightenBy20
lightenBy40
lightenBy60
saturateBy20
saturateBy40
saturateBy60
rotate90
rotate180
rotate270
cropSquareTopLeft
cropSquareTopRight
cropSquareBottomLeft
cropSquareBottomRight
cropSquareCenter
