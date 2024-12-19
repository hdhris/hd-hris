// // Step 1: Define interfaces for the objects
// interface Address {
//     city: string;
//     state: string;
//   }

//   interface User {
//     name: string;
//     address: Address;
//   }

//   interface Settings {
//     theme: string;
//     notifications: boolean;
//   }

//   interface Data {
//     user: User;
//     settings: Settings;
//   }

//   // Step 2: Define your original object
//   const data: Data = {
//     user: {
//       name: 'John Doe',
//       address: {
//         city: 'New York',
//         state: 'NY',
//       },
//     },
//     settings: {
//       theme: 'dark',
//       notifications: true,
//     },
//   };

//   // Step 3: Define another object with similar structure
//   const newData: Data = {
//     user: {
//       name: 'Jane Smith',
//       address: {
//         city: 'San Francisco',
//         state: 'CA',
//       },
//     },
//     settings: {
//       theme: 'light',
//       notifications: false,
//     },
//   };

// Step 4: Create the pathOf function
export const pathOfObject = (obj: any, path: string[] = []): string => {
    if (obj && typeof obj === "object") {
        for (const key in obj) {
            if (obj[key] === path) {
                return [...path, key].join("."); // Join keys to form the full path
            }
            const result = pathOfObject(obj[key], [...path, key]);
            if (result) {
                return result;
            }
        }
    }
    return ""; // Return empty string if not found
};

// Step 5: Create the getValue function
export const valueOfObject = <T>(obj: T, path: string): any => {
    return path.split(".").reduce((current, key) => {
        if (!current) return undefined; // Handle undefined/null values gracefully

        // Handle array traversal
        if (Array.isArray(current)) {
            return current.map((item) => (item as Record<string, any>)[key]);
        }

        // Standard object key access
        return (current as Record<string, any>)[key];
    }, obj);
};

//   // Example usage: Get the path to the user's city
//   const pathToUserCity = pathOfObject(data.user.address.city);
//   console.log(pathToUserCity); // Output: "user.address.city"

//   // Use the path to access the value in another object
//   const userCityInNewData = valueOfObject(newData, pathToUserCity);
//   console.log(userCityInNewData); // Output: "San Francisco"
