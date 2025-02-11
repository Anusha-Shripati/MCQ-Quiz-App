import { NextResponse } from "next/server";
import { exec } from "child_process";
import util from "util";

const execPromise = util.promisify(exec);
function sanitizeCode(code: string, language: string): string {
    if (language === "javascript") {
      // Remove comments (both single-line and multi-line) from JavaScript
      code = code.replace(/\/\/.*$/gm, ''); // Remove single-line comments
      code = code.replace(/\/\*[\s\S]*?\*\//g, ''); // Remove multi-line comments
  
      // Escape special characters to prevent issues in shell commands
      code = code.replace(/(["$`\\])/g, '\\$1');
    } else if (language === "php") {
      // Remove comments (both single-line and multi-line) from PHP
      code = code.replace(/\/\/.*$/gm, ''); // Remove single-line comments
      code = code.replace(/\/\*[\s\S]*?\*\//g, ''); // Remove multi-line comments
      code = code.replace(/#.*$/gm, ''); // Remove hash comments in PHP
  
      // Escape special characters to prevent issues in shell commands
      code = code.replace(/(["$`\\])/g, '\\$1');
    }
  
    return code;
  }
  
  

export async function POST(req: Request) {
  try {
    const { language, code } = await req.json();
    if (!language || !code) {
      return NextResponse.json({ success: false, error: "Invalid input" });
    }

    let result: unknown = {};
    const tempFilePath = `/tmp/temp_code`;
    if (language === "javascript") {
      // Temporarily write code to a .js file and run it using Node.js
      const sanitizedCode = sanitizeCode(code, "javascript");
      const codeFile = "/tmp/temp_code.js";
      await execPromise(`echo "${sanitizedCode}" > ${codeFile}`);

      // Execute the code using Node.js
      const { stdout, stderr } = await execPromise(`node ${codeFile}`);

      // Check if there's an error
      if (stderr) {
        result = { success: false, error: stderr };
        } else {
            result = { success: true, output: stdout };
        }
        } else if (language === "python") {
            // Write Python code to a temporary file
            const sanitizedCode = sanitizeCode(code, "python");
            const pyFile = `${tempFilePath}.py`;
            await execPromise(`echo "${sanitizedCode}" > ${pyFile}`);
      
            // Execute the Python code
            const { stdout, stderr } = await execPromise(`python3 ${pyFile}`);
      
            // Handle output and errors
            result = stderr
              ? { success: false, error: stderr }
              : { success: true, output: stdout };
          } else if (language === "php") {
            // Sanitize PHP code to remove comments and escape special characters
            const sanitizedCode = sanitizeCode(code, "php");
          
            // Temporarily write sanitized PHP code to a .php file
            const codeFile = "/tmp/temp_code.php";
            await execPromise(`echo "${sanitizedCode}" > ${codeFile}`);
          
            // Execute the PHP code using the PHP interpreter
            const { stdout, stderr } = await execPromise(`php ${codeFile}`);
          
            // Check for any errors during execution
            if (stderr) {
              result = { success: false, error: stderr };
            } else {
              result = { success: true, output: stdout };
            }
          } else {
            result = { success: false, error: `Unsupported language: ${language}` };
          }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/code-execution:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}
