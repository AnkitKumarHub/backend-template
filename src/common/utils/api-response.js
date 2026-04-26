// for the standard response format of the API -> always use class to create the response object

class ApiResponse {

    static ok(res, message, data = null){
        return res.status(200).json({
            success: true,
            message,
            data
        })
    }

    static created(res, message, data = null){
        return res.status(201).json({
            success: true,
            message, 
            data
        })
    }

    static noContent(res){
        return res.status(204).send();
    }
}

// how to use -> ApiResponse.ok(res, "the response is good!")

export default ApiResponse;