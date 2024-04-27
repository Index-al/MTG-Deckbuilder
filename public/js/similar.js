    // Test API for validity, Store API key on submission
    submitAPI.click(function(event) {
        event.preventDefault();
        apiKey = inputAPI.val();

        var prompt = 'Test'; // Test prompt to ensure API key is working

        fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + apiKey
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo-1106',
                    messages: [{
                        role: "system",
                        content: prompt
                    }],
                    max_tokens: 25
                })
            })
            .then(response => {
                if (response.ok) {
                    // API key is valid, go ahead and set it to local storage
                    localStorage.setItem('apiKey', apiKey); // sets the API key in localStorage
                    pageAPI.hide(); // hides the form
                    userPreferences.show(); // shows the user preferences form
                    console.log("Key is valid, saved to localStorage!");
                } else {
                    $('<p style="color:red">API Key is not valid. Please try again.</p>').appendTo(pageAPI); // shows error message, might need to style later
                    inputAPI.val(''); // clears the API input form field

                    setTimeout(function() {
                        $('p').remove(); // remove the error message after delay
                    }, 2000);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                $('<p style="color:red">Something went wrong, please try again</p>').appendTo(pageAPI); // in case something else goes wrong during submission
            });
    });