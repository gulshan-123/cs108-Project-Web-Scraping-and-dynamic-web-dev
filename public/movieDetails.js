//purpose: To handle to the Show ALl review button on positive and negative reviews

function showAllReviews(type, numReviews) {
    for (let i = 3; i < numReviews; i++) {
        let reviewElement = document.getElementById(`${type}-review-${i}`);
        let hrTag = document.getElementById(`${type}-hr-${i}`);
        if (reviewElement) {
            reviewElement.classList.remove('d-none');
            if (hrTag) {
                hrTag.classList.remove('d-none');
            }
            // hrTag.classList.remove('d-none');
        }
    }
    event.target.style.display = 'none';
}

// purpose: To handle the Read More button on the positive and negative reviews`
    document.addEventListener('click', function(event) {
        if (event.target.matches('.read-more')) {
            let review = event.target.closest('.blockquote');
            let shortText = review.querySelector('.short-text');
            let fullText = review.querySelector('.full-text');
            shortText.classList.toggle('d-none');
            fullText.classList.toggle('d-none');
            event.target.textContent = event.target.textContent === 'Read More' ? 'Read Less' : 'Read More';
        }
    });