# CryptoTrackLive - Change Log

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
