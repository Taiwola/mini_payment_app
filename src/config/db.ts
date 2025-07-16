import knexFile from "../../knexfile"

const env = process.env.NODE_ENV || "development"
const options = knexFile[env]

export default options
