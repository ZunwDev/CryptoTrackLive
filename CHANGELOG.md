# CryptoTrackLive - Change Log

## Version 0.15.2 Beta

### New Features

- Introducing more flexible zoom options including 1d, 7d, 30d, 90d, 365d, and an all-encompassing view dating back to January 1st, 2016.
- Detailed chart now displays timestamps and dates on the X scale for better context.
- Users receive an "N/A" warning when attempting to convert to unsupported currencies within the market table.

### Refinements and Optimizations

- Codebase streamlined for significantly faster page loading times.
- Improved search speed from 1 second to a swift 200 milliseconds.

### Resolved Issues

- Addressed unnecessary data loading during the detail page rewrite.
- Removed the initial title for improved chart clarity and focus on the detail page.

## Version 0.15.1 Beta

### Changes

- Revamped chart appearance by implementing gradient backgrounds for a more engaging visual display.
- Adjusted the background for the homepage chart, providing a cleaner and clearer presentation.
- Enhanced the data display on the chart to showcase the maximum available information from the API.
- Refined the chart's real-time data integration, ensuring it accurately reflects the current time.
- Reimagined the loading design on the detail page to resemble a skeleton structure (Work in progress).
- Introduced a "New" tag to highlight the most recent news entries, enhancing their visibility.
- Rearticulated the text content within entries, improving overall readability.
- Optimized component organization for more efficient importing and management.
- Implemented responsive features for the chart, ensuring adaptability across various screen sizes.
- Streamlined the chart on the detail page by removing the legend for a cleaner interface.
- Various enhancements and optimizations under the hood for improved performance and usability.

## Version 0.15 Beta

### New features

- Added coin news
  - latest news based on what coin you are looking on
  - there's also news from twitter and reddit, but they aren't reliable that much (some of them are really old (even few years))

### Up and coming

- Next update will bring currency converting directly in the detail page, i.e. turn usd into eur etc. and also chart zoom probably

## Version 0.14.4 Beta

### Changes

- Refined chart loading in the detail page for optimized performance.
- Enhanced chart responsiveness to screen resizing, ensuring a seamless experience across different screen sizes - (it doesn't matter on phones because on phone it's going to load just fine)
- Conducted extensive code refactoring, resulting in cleaner and more optimized codebase.
- Implemented improved media handling, clearing old media when users switch coins in the detail page.
- Streamlined chart loading: now, when a user revisits the detail page, the chart won't be destroyed but will update with smooth animations. This change doesn't apply to the charts on home page, since it wouldn't work
- Prevented users from backtracking through detail pages, ensuring a direct return to the home page.
- Enhanced market data loading by selectively updating only the necessary data instead of refreshing everything.

### Fixes

- Rectified data loading issues on the detail page, preventing redundant reloads when switching pages in the markets table.
- Resolved multiple data loading instances on the detail page, enhancing overall performance by preventing unnecessary data loading.

### Up and coming

- Prepared and structured news data, focusing on English language content, news will be pursuant to what coin is user viewing, i.e. if user is on bitcoin it will show only/mostly news about bitcoin, these go for every coin (not sure if less-known coins will have any news)
- Prepared store for chart zoom (1d, 3d, 7d etc upto one year)

### Technical

- If you are in detail page, and update the codebase with live deploy/update, the chart doesn't load => refresh fixes it (doesn't affect users)
- Upon returning to a locally hosted detail page and navigating back (popstate), users are redirected to the deployed app instead of the local host.
- Added aliases @ for paths instead of ../../.. etc., these go for all main folders (types doesn't work for some reason, any else do)

## Version 0.14.3 Beta

### New features

- Added coin market into detail page
  - **one downbad for this system is, sometimes may CORS issue show up => user needs to refresh the page**
  - this contains already pagination and possibility to how much entries user can see
  - already is responsive on smaller screens
  - shows only verified exchanges/markets
  - when clicking on "TRADE NOW" it will open new tab

### Changes

- PC - Changed the chart container to be as same height as the overview + media
- Made media container strict height, it's no more fit, it will overflow now
- Added resources into README.md

## Version 0.14.2 Beta

### Changes

- Removed all redundant tailwind classes (the one used for responsiveness)
- Optimized data fetching, added try-catch stuff to avoid later on issues, removed the pointless functions
- Added currency identication into overview cards
- Overall code optimalization
- Commented out all code that is connected to live data updating on home page
- Sped up search logic, now it gets data only once and searches on them, they change only if user changes currency

## Version 0.14.1 Beta

### New features

- Added coin's media into detail page

### Fixes

- Fixed detail page responsive on phones (some weird cropping of content, etc.)
- Fixed overview in detail page, the rank indicator not having cornered corner (phone only)
- Fixed detail not updating, when user searched another coin and wanted to see it (had to refresh the page)

### Known issues

- Some icons don't exist or are outdated in current set of icons, probably gonna use different icon library (this is only for media in detail page)
- Chart isn't resizing automatically when user changes dimensions (not sure if fixable - current solution that works is to refresh a page)

## Version 0.14 Beta

### New features

- Added detail page, still work in progress, but it's currently usable, expect more info later, it's responsive

### Changes

- Removed turning light/dark mode with burger menu icon, on phones, separate menu will be added
- Added detail page image to README

### Fixes

- Changed API key, so now the app will work

### Technical

- ATH (alltimehigh) in detail page will always be in USD, because API for some reason doesn't support different currencies (maybe possible with custom converting, not sure rn)

## Version 0.13.6 Beta

### New features

- Added overview for coins
- Added custom scrollbar design (should support all most used browsers)

### Changes

- Updated README image

## Version 0.13.5 Beta

### New features

- Added pagination, with entry change support
- Added text that shows which shows current sort

## Version 0.13.4.3 Beta

### Changes

- Changed how search works, now should be more faster
- Made colors for light mode more brighter
- More adjustments for responsiveness, when on phone, only 5 main columns will be visible
- Removed icon column from table, added it to coin instead
- Added padding and centered text in the last line in the footer
- Changed README, to be more describeful
- Optimized code

### Fixes

- Fixed footer for phones (removed the black bar below it)

## Version 0.13.4.2 Beta

### New features

- Hide search menu when user clicks any searched item

### Fixes

- Fixed stuck loading in table
- Fixed URL stacking when going multiple times to same page

## Version 0.13.4.1 Beta

### Fixes

- Fixed build errors

## Version 0.13.4 Beta

### New features

- Uploaded app to vercel free hosting, link: https://vercel.com/zunwdev/crypto-track

### Changes

- Adjusted auto-scrolling behavior when user changes entry count for coins
- Code optimization

## Version 0.13.3 Beta

### New features

- Added a footer to the page
- Added error pages to all routes / WIP

### Changes

- Optimized code even more
- Changed README.md a bit
- Relocated files for better file organization
- More preparation for detail page

## Version 0.13.2 Beta

### New features

- Added search, search between top 100 ranked cryptocurrencies
- Added loading icon, when data are being loaded, this applies to the table, and search
- Added no coins text, if no coins found in search

### Changes

- Data for charts start at 00:00 and ends at < current_hour >:00
- Optimized code at some point

### Fixes

- Fixed centering of main title (crazy)

## Version 0.13.1 Beta

### New features

- Added template data for search, since API doesn't return data by regex - this means search will not work (yet)
- Added chart updating and faster loading, when any setting changes (ex. sorting, changing currency etc.)

### Changes

- Changed README
- Disabled tooltips in charts
- Optimized code

## Version 0.13 Beta

### New features

- Added weekly charts of prices (later will be possible to change timing)
- Added sorting for rank, coin (name), price, and volume / descending and ascending
- Search bar can be now focused by "/" on keyboard

### Changes

- Changed how search bar looks
- Added icon to coin entry amount
- Optimized some parts of code
- Cleaned some parts of code

## Version 0.12 Beta

### New Features

- Added a way to scroll up from bottom of the table
- Added option to change how much coins will be visible on one page
- Added searchbar (doesn't work yet)
- Added more responsive design

### Changes

- Cleaned code

## Version 0.11 Beta

### Changes

- Moved the public API into .env file
- Preparation for coin view
- File organization

### Fixes

- Fixed opening currency converter and update rate changer

## Version 0.1

### New Features

- Added main table to view cryptocurrencies
- Added currency converting / automatically updates the table
- Added update rate changer
- Added dark/light mode
