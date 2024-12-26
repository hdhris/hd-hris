export const employee_basic_details = {
    id: true,
    picture: true,
    email: true,
    prefix: true,
    first_name: true,
    last_name: true,
    middle_name: true,
    extension: true,
    suffix: true,
}

export const employee_validation = {
    deleted_at: null,
    OR: [{
        termination_json: {
            equals: []
        }
    }, {
        resignation_json: {
            equals: []
        }
    }]
}