import React from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

const generateLines = () => {
  let lines = "";
  for (let i = 1; i <= 500; i++) {
    lines += `${i}行目<br>`;
  }
  return lines;
};

const htmlContent = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link href="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/summernote@0.8.20/dist/summernote.min.css" rel="stylesheet">
  <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/summernote@0.8.20/dist/summernote.min.js"></script>
  <style>
    html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }
    .note-editor { border: none !important; height: 100% !important; display: flex !important; flex-direction: column !important; }
    .note-toolbar { flex-shrink: 0; background: #fff; }
    .note-editing-area { flex: 1 !important; overflow: hidden !important; }
    .note-editable { height: 100% !important; overflow-y: auto !important; }
    .note-statusbar { display: none; }
  </style>
</head>
<body>
  <div id="summernote"></div>
  <script>
    $(document).ready(function() {
      var content = '';
      for (var i = 1; i <= 1500; i++) {
        content += '<p>' + i + '行目</p>';
      }
      $('#summernote').summernote({
        height: '100%',
        toolbar: [
          ['style', ['style']],
          ['font', ['bold', 'italic', 'underline', 'clear']],
          ['fontname', ['fontname']],
          ['fontsize', ['fontsize']],
          ['color', ['color']],
          ['para', ['ul', 'ol', 'paragraph']],
          ['table', ['table']],
          ['insert', ['link', 'picture']],
          ['view', ['fullscreen', 'codeview', 'help']]
        ]
      });
      $('#summernote').summernote('code', content);
    });
  </script>
</body>
</html>
`;

export default function SummerNoteEditor() {
  return (
    <View style={styles.container}>
      <WebView
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={["*"]}
        scrollEnabled={false}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 500,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  webview: {
    flex: 1,
  },
});
