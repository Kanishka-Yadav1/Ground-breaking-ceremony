Place the licensed brand web fonts here as .woff2 files with these exact names:

  NeueMontreal-Regular.woff2
  NeueMontreal-Medium.woff2
  NeueMontreal-Bold.woff2
  TTCommonsPro-Regular.woff2
  TTCommonsPro-DemiBold.woff2

The @font-face rules in app/globals.css already point to these paths, so the
fonts load automatically once the files are present. If a file is missing,
that weight falls back to the brand's system stack (Helvetica Neue, Arial).
