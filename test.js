(async () => {

    async function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    let a = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

    let newArray =  await shuffle(a)

    console.log(newArray)

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