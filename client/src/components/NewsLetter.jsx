const NewsLetter = () => {
    return (
        <div className="flex flex-col items-center justify-center text-center space-y-4 mt-24 pb-12 px-4 sm:px-6 md:px-0">
            <h1 className="text-2xl md:text-4xl font-semibold">Never Miss a Deal!</h1>
            <p className="text-gray-500/70 text-sm md:text-lg max-w-xl">
                Subscribe to get the latest offers, new arrivals, and exclusive discounts
            </p>

            <form className="flex flex-col sm:flex-row items-center justify-center gap-2 w-full max-w-2xl">
                <input
                    className="flex-1 border border-gray-300 rounded-md sm:rounded-r-none px-3 py-2 text-gray-500 outline-none w-full"
                    type="email"
                    placeholder="Enter your email id"
                    required
                />
                <button
                    type="submit"
                    className="w-full sm:w-auto bg-primary text-white hover:bg-dull-primary transition-all px-8 sm:px-12 py-2 rounded-md sm:rounded-l-none"
                >
                    Subscribe
                </button>
            </form>
        </div>
    )
}

export default NewsLetter;
