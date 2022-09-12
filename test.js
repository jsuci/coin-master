(async () => {
    let a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    let gap = 4
    let start = 0
    let end = 0
    for (let i = 0; i < a.length; i++) {

        start = end
        end = end + gap

        let users = a.slice(start, end)
        if (users.length == gap) {
            console.log(users)
        }

        


    }
})();