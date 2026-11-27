// Remotion configuration — binding export standard for standalone video sequences
// (docs/PRODUCTION_STANDARDS.md §10): 4K UHD, 30 fps, H.264, CRF 16, SDR Rec. 709,
// limited range yuv420p, AAC 48 kHz — imports cleanly into CapCut.
// Resolution: compositions are designed at 1920x1080 and rendered with `--scale=2`
// (re-rendered at 2x, not upscaled); 4K-native compositions (TasanBrandIntro) render at scale 1.
// Transparent overlays (alpha) are exported separately and do NOT use these settings.
import { Config } from '@remotion/cli/config';

Config.setCodec('h264');
Config.setCrf(16);
Config.setPixelFormat('yuv420p');
Config.setColorSpace('bt709');
Config.setVideoImageFormat('png');
Config.setOverwriteOutput(true);
