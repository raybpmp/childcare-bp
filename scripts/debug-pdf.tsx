import React from 'react';
import ReactPDF, { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import path from 'path';

const styles = StyleSheet.create({
    page: { flexDirection: 'row', backgroundColor: '#E4E4E4' },
    section: { margin: 10, padding: 10, flexGrow: 1 }
});

const MyDocument = () => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.section}>
                <Text>Section #1</Text>
            </View>
            <View style={styles.section}>
                <Text>Section #2</Text>
            </View>
        </Page>
    </Document>
);

const OUTPUT_PATH = path.join(process.cwd(), 'debug-output.pdf');

console.log('Starting debug render...');
try {
    await ReactPDF.renderToFile(<MyDocument />, OUTPUT_PATH);
    console.log(`Rendered to ${OUTPUT_PATH}`);
} catch (e) {
    console.error('Render failed:', e);
}
