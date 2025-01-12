import {NextResponse} from "next/server";
import {
    PrismaClientInitializationError,
    PrismaClientKnownRequestError,
    PrismaClientUnknownRequestError, PrismaClientValidationError
} from "@prisma/client/runtime/library";
import {PrismaClientRustPanicError} from "@prisma/client/runtime/binary";



export function getPrismaErrorMessage(error: any){
    const errorMessages: Record<string, string> = {
        P1000: `There was an issue with the database login. The credentials provided are incorrect. Please double-check your username and password.`,
        P1001: `We couldn't connect to the database server. Please ensure the server is running.`,
        P1002: `The database server is taking too long to respond. Please try again later.`,
        P1003: `The specified database file could not be found.`,
        P1008: `The operation timed out. Please try again.`,
        P1009: `A database with the specified name already exists on the server.`,
        P1010: `The user does not have permission to access the database.`,
        P1011: `There was an error establishing a secure connection to the database.`,
        P2025: `An operation failed because it depends on records that were not found. Please check that the required data exists.`,
        P1012: `There was a problem with the schema. Please refer to the Prisma documentation for help resolving schema issues.`,
        P1013: `The database connection string provided is invalid.`,
        P1014: `The specified model does not exist in the database.`,
        P1015: `Your Prisma schema is using features that are not supported by your database version. Please check the database version and feature compatibility.`,
        P1016: `Your query had an incorrect number of parameters. Please check the parameters in the query.`,
        P1017: `The database server closed the connection unexpectedly.`,
        P2000: `The value provided for a column is too long for the column's type. Please check your input.`,
        P2001: `The record you're searching for does not exist.`,
        P2002: `A unique constraint was violated. Please make sure the value is unique.`,
        P2003: `A foreign key constraint failed. Please check your references.`,
        P2004: `A database constraint failed. Please check the database rules.`,
        P2005: `The value stored in the database for the field is not valid.`,
        P2006: `The provided value for the field is not valid.`,
        P2007: `There was a data validation error.`,
        P2008: `There was an error parsing the query. Please check the syntax.`,
        P2009: `The query couldn't be validated. Please check the query for errors.`,
        P2010: `The raw query failed. Please check the error details.`,
        P2011: `A null value was provided for a field that requires a value.`,
        P2012: `A required value is missing. Please check the input.`,
        P2013: `A required argument is missing for a field. Please check the query.`,
        P2014: `The change you're trying to make violates the relationship between models. Please check the related models.`,
        P2015: `A related record could not be found. Please ensure all related records exist.`,
        P2016: `There was an error interpreting your query. Please check the query syntax.`,
        P2017: `The records for the relation between models are not connected.`,
        P2018: `Required connected records could not be found. Please ensure the data is correctly connected.`,
        P2019: `There was an input error. Please check your input values.`,
        P2020: `The value provided for the field is out of range. Please ensure the value fits the expected range.`,
        P2021: `The specified table does not exist in the current database.`,
        P2022: `The specified column does not exist in the current database.`,
        P2023: `There is an issue with the column data. Please check the data in your table.`,
        P2024: `We couldn't get a new connection from the pool. Please check the connection pool settings.`,
        P2026: `The database provider doesn't support a feature that your query tried to use. Please check your query.`,
        P2027: `Multiple errors occurred during the query execution. Please check the query details.`,
        P2028: `There was an error with the transaction API. Please try again.`,
        P2029: `Query parameter limit exceeded. Please reduce the number of parameters in your query.`,
        P2030: `A fulltext index is missing for your search. Please add a fulltext index to your schema.`,
        P2031: `Prisma requires transactions to work with MongoDB in a replica set configuration. Please ensure your MongoDB server is set up as a replica set.`,
        P2033: `A number in your query is too large for a 64-bit signed integer. Consider using BigInt for large numbers.`,
        P2034: `The transaction failed due to a write conflict or a deadlock. Please try your transaction again.`,
        P2035: `There was an assertion violation on the database. Please check the error details.`,
        P2036: `There was an error with an external connector. Please check the external system.`,
        P2037: `Too many database connections are open. Please close some connections and try again.`
    };

    if(error instanceof PrismaClientKnownRequestError) {
        const template = errorMessages[error.code];
        console.log("Error PrismaClientKnownRequestError: ", template)
        return NextResponse.json({
            success: false,
            message: `${template || "No additional details available."}`
        }, {status: 500});
    } else if(error instanceof PrismaClientRustPanicError){
        console.log("Error PrismaClientRustPanicError: ", error)
        return NextResponse.json({
            success: false,
            message: `An unexpected error occurred: ${error.message || "No additional details available."}`
        }, {status: 500});
    } else if(error instanceof PrismaClientUnknownRequestError){
        console.log("Error PrismaClientUnknownRequestError: ", error)
        return NextResponse.json({
            success: false,
            message: `An unexpected error occurred: ${error.message || "No additional details available."}`
        }, {status: 500});
    }else if(error instanceof PrismaClientInitializationError){
        const template = errorMessages[error.errorCode!];
        console.log("Error PrismaClientInitializationError: ", error)
        return NextResponse.json({
            success: false,
            message: `An unexpected error occurred: ${template || "No additional details available."}`
        },{status: 500})

    }else if(error instanceof PrismaClientValidationError){
        console.log("Error PrismaClientValidationError: ", error)
        console.log("Error Stack: ", error.stack)
        return NextResponse.json({
            success: false,
            message: `An unexpected error occurred: There is an error while validating your inputs`
        }, {status: 500})
    } else{
        return NextResponse.json({
            success: false,
            message: `An unexpected error occurred: ${error.message || "No additional details available."}`
        }, {status: 500});
    }
}
