# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added
- Created Changelog

## [1.6.0] - 2016-07-23
### Added
- [`getdevicelist`] support for `device_id`, `get_favorites` as parameters via ([#19])
- [`getstationsdata`] support for `device_id`, `get_favorites` as parameters via ([#19])

### Removed
- [`getstationsdata`] support for `app_type` parameter via ([#19])

Thank you to [@tonyliu7870] for their pull request.


## [1.5.0] - 2016-04-12
### Added
- [`gethomedata`] via ([#18])
- [`getnextevents`] via ([#18])
- [`geteventsuntil`] via ([#18])
- [`getlasteventof`] via ([#18])
- [`getcamerapicture`] via ([#18])
- option for access token to be provided in the constructor via ([#16])

### Fixed
- `_parse` body only when content-type is 'application/json'_ problem via ([#15])

Thank you to [@SeraphimSerapis], [@janhuddel], and [@Nibbler999] for their pull requests.


## [1.4.0] - 2016-01-21
### Added
- [`getthermostatsdata`] functionality via ([#14])
- [`getstationsdata`] api call via ([#11])
- More documentation via ([#14])

### Fixed
- `error-message` from response via ([#13])

### Changed
- Updated urls in comments to the new netatmo urls via ([#11])

Thank you to [@patricks], [@janhuddel], and [@marcuspocus] for their pull requests.


## [1.2.0] - 2015-05-05


## [1.1.0] - 2014-05-06


## [1.0.1] - 2014-05-02


## 1.0.0 - 2014-03-13


[Unreleased]: https://github.com/karbassi/netatmo/compare/v1.6.0...HEAD
[1.6.0]: https://github.com/karbassi/netatmo/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/karbassi/netatmo/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/karbassi/netatmo/compare/v1.2.0...v1.4.0
[1.2.0]: https://github.com/karbassi/netatmo/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/karbassi/netatmo/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/karbassi/netatmo/compare/v1.0.0...v1.0.1

[#19]: https://github.com/karbassi/netatmo/pull/19
[#18]: https://github.com/karbassi/netatmo/pull/18
[#17]: https://github.com/karbassi/netatmo/pull/17
[#16]: https://github.com/karbassi/netatmo/pull/16
[#15]: https://github.com/karbassi/netatmo/pull/15
[#14]: https://github.com/karbassi/netatmo/pull/14
[#13]: https://github.com/karbassi/netatmo/pull/13
[#12]: https://github.com/karbassi/netatmo/pull/12
[#11]: https://github.com/karbassi/netatmo/pull/11

[`getcamerapicture`]: https://dev.netatmo.com/dev/resources/technical/reference/welcome/getcamerapicture
[`getdevicelist`]: https://dev.netatmo.com/dev/resources/technical/reference/weatherstation/getstationsdata
[`geteventsuntil`]: https://dev.netatmo.com/dev/resources/technical/reference/welcome/geteventsuntil
[`gethomedata`]: https://dev.netatmo.com/dev/resources/technical/reference/welcome/gethomedata
[`getlasteventof`]: https://dev.netatmo.com/dev/resources/technical/reference/welcome/getlasteventof
[`getnextevents`]: https://dev.netatmo.com/dev/resources/technical/reference/welcome/getnextevents
[`getstationsdata`]: https://dev.netatmo.com/dev/resources/technical/reference/weatherstation/getstationsdata
[`getthermostatsdata`]: https://dev.netatmo.com/dev/resources/technical/reference/thermostat/getthermostatsdata

[@tonyliu7870]: https://github.com/tonyliu7870
[@SeraphimSerapis]: https://github.com/SeraphimSerapis
[@janhuddel]: https://github.com/janhuddel
[@Nibbler999]: https://github.com/Nibbler999
[@patricks]: https://github.com/patricks
[@janhuddel]: https://github.com/janhuddel
[@marcuspocus]: https://github.com/marcuspocus
