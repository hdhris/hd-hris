import {Parser} from 'sql-ddl-to-json-schema';

export const parseSqlFile = async (fileUrl: string) => {
    // Fetch the SQL file content from the remote URL
    const response = await fetch(fileUrl);

    if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const sqlContent = await response.text();

    const parser = new Parser('mysql'); // Adjust to your SQL dialect
    return parser.feed(sqlContent).toJsonSchemaArray();
};
