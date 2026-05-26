import {
	ClassicEditor,
	Autoformat,
	Bold,
	Italic,
	Underline,
	Strikethrough,
	BlockQuote,
	Heading,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	ImageResize,
	Link,
	List,
	Paragraph,
	Table,
	TableToolbar,
	TextTransformation,
	Essentials,
    Font,
    Alignment,
    WordCount,
    Highlight,
    MediaEmbed,
    Indent,
    Undo,
    HtmlEmbed,
    SourceEditing,
    GeneralHtmlSupport,
    Code,
    CodeBlock,
    HorizontalLine,
    RemoveFormat,
    SpecialCharacters,
    FindAndReplace,
    SelectAll,
    Subscript,
    Superscript
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

export default class CKEditorCustomBuild extends ClassicEditor {
    public static override builtinPlugins = [
		Autoformat,
		BlockQuote,
		Bold,
        Italic,
        Underline,
        Strikethrough,
		Heading,
		Image,
		ImageCaption,
		ImageStyle,
		ImageToolbar,
		ImageUpload,
        ImageResize,
		Link,
		List,
		Paragraph,
		Table,
		TableToolbar,
		TextTransformation,
		Essentials,
        Font,
        Alignment,
        WordCount,
        Highlight,
        MediaEmbed,
        Indent,
        Undo,
        HtmlEmbed,
        SourceEditing,
        GeneralHtmlSupport,
        Code,
        CodeBlock,
        HorizontalLine,
        RemoveFormat,
        SpecialCharacters,
        FindAndReplace,
        SelectAll,
        Subscript,
        Superscript
	];

    public static override defaultConfig = {
        toolbar: {
            items: [
                'undo', 'redo', '|',
                'heading', '|',
                'bold', 'italic', 'underline', 'strikethrough', 'highlight', '|',
                'fontFamily', 'fontSize', 'fontColor', 'fontBackgroundColor', '|',
                'alignment', 'outdent', 'indent', '|',
                'bulletedList', 'numberedList', '|',
                'blockQuote', 'link', 'insertTable', 'uploadImage', 'mediaEmbed', 'htmlEmbed', 'sourceEditing', '|',
                'removeFormat', 'specialCharacters', 'horizontalLine', 'code', 'codeBlock', 'subscript', 'superscript'
            ],
            shouldNotGroupWhenFull: false
        },
        image: {
            toolbar: [
                'imageStyle:inline',
                'imageStyle:block',
                'imageStyle:side',
                '|',
                'toggleImageCaption',
                'imageTextAlternative'
            ]
        },
        table: {
            contentToolbar: [
                'tableColumn',
                'tableRow',
                'mergeTableCells',
                'tableProperties',
                'tableCellProperties'
            ]
        },
        language: 'en',
        licenseKey: 'GPL' // Use GPL license for Open Source version
    };
}
