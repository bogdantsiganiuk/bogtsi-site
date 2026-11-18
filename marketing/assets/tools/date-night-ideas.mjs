// Date night picker. Ideas are the free ideas from the Dahlia app catalogue
// (every idea in a free deck, i.e. premium === false).

const RAW = [
  ["cf-chase-sunset","Chase the Sunset","Find the highest point you can reach on foot nearby and time your arrival for sundown, then narrate the colors to each other like sports commentators.","free","quick","out"],
  ["cf-chalk-truth-dare","Sidewalk Chalk Truth or Dare","Draw a giant truth-or-dare board in chalk on the driveway or sidewalk, then take turns rolling a coin onto it to decide who answers what.","cheap","quick","out"],
  ["cf-blind-taste-test","Blindfolded Snack Taste Test","Line up five random pantry items, blindfold your partner, and see if they can guess each one by taste and smell alone.","free","quick","in"],
  ["cf-two-coin-walk","Two-Coin Treasure Walk","Each bring exactly the same small amount of spare change, walk until you find something worth spending it on, and split whatever you find.","cheap","quick","out"],
  ["cf-gratitude-jar","Gratitude Jar Refill","Sit together and write ten new notes for your gratitude jar, one thing you appreciate about the other person on each slip.","free","quick","in"],
  ["cf-star-map-lie-down","Star Map Backyard Lie-Down","Lie on a blanket outside after dark, use a stargazing app on one phone only, and try to find three constellations before you both get cold.","free","evening","out"],
  ["cf-free-museum-hour","Home Pop-Up Gallery","Turn your own home into a pop-up gallery: each pick five objects, photos, or doodles that mean something to you, arrange them around a room like an exhibit, and give each other a guided tour explaining the artist's choices.","free","evening","in"],
  ["cf-vending-gamble","Loose-Change Vending Gamble","Pool whatever coins you have, pick a vending machine, and let your partner choose blind for both of you.","cheap","quick","out"],
  ["cf-thrift-style-swap","Thrift Store Style Swap","Give each other a tiny budget and ten minutes in a secondhand shop to pick one item for the other to wear that day.","cheap","evening","out"],
  ["cf-pantry-recipe-night","Empty-the-Pantry Recipe Night","Pick a recipe using only ingredients already in your kitchen, cook it together with no recipe app open after step one, and name the dish yourselves.","free","evening","in"],
  ["cf-park-bench-debate","Park Bench Debate Hour","Sit on any public bench and debate a silly hypothetical question for twenty minutes straight, switching sides halfway through.","free","quick","out"],
  ["cf-library-cover-dare","Library Card Cover Dare","Each pick a book for the other based only on the cover, then read the first chapter aloud to each other that night.","free","evening","in"],
  ["cf-coin-flip-wander","Coin-Flip Wander","Flip a coin at your front door; heads you turn left, tails you turn right, and keep walking until something makes you both stop.","free","quick","out"],
  ["si-floor-picnic","Living-Room Floor Picnic","Spread a blanket on the floor, plate up whatever is in the fridge, and eat by candlelight with both phones left in another room.","free","evening","in"],
  ["si-pillow-fort","Pillow Fort Movie Marathon","Build the most ridiculous blanket fort your living room allows, then watch a trilogy inside it with only the snacks you can pass through the door flap.","free","allday","in"],
  ["si-one-song-dance","Slow Dance to One Song","Pick one song neither of you has heard in years, clear a patch of floor, and slow dance to it twice in a row.","free","quick","in"],
  ["si-blind-portraits","Draw Each Other Blind","Sit back to back, each sketch a portrait of the other from memory without looking, then reveal and frame the worse one.","free","quick","in"],
  ["si-childhood-dish-swap","Cook Each Other's Childhood Dish","Each research and cook the meal the other remembers most fondly from childhood, then trade plates halfway through.","cheap","evening","in"],
  ["si-card-tournament","Two-Player Card Tournament","Run a best-of-nine tournament through every two-player card game you both know, keeping score on the back of an envelope.","free","evening","in"],
  ["si-twenty-questions","Twenty Questions, No Repeats","Take turns asking questions you've genuinely never asked each other before, twenty rounds, no small talk allowed.","free","evening","in"],
  ["si-bath-playlist-swap","Bath and Playlist Swap","Draw a bath big enough for a shared soak, and each build a five-song playlist that says something you haven't said out loud.","cheap","evening","in"],
  ["si-timed-massage-trade","Massage Trade, Timed","Set a timer for ten minutes each and trade shoulder or foot massages, no talking allowed until the timer resets.","free","quick","in"],
  ["si-home-spa-hour","Home Two-Person Spa Hour","Turn the bathroom into a two-person spa for an hour with face masks, warm towels, and a shared playlist of nothing but instrumentals.","cheap","evening","in"],
  ["si-furniture-free-nest","Furniture-Free Living Room","Push the furniture to the walls for one evening and turn the empty floor into a blanket-cushion nest for talking, stretching, or just lying still together.","free","evening","in"],
  ["si-charades-marathon","Silent Charades Marathon","Play charades using only house objects as clues for an hour; the loser does the dishes for the week.","free","evening","in"],
  ["si-cold-playlist-swap","Trade Playlists Cold","Hand each other your phone with headphones split between you, and listen to a song the other picked without any explanation first.","free","quick","in"],
  ["qk-doorstep-photoshoot","Doorstep Photo Shoot","Step outside your own front door and take twenty photos of each other in under five minutes; the worst one becomes a phone background for a week.","free","quick","out"],
  ["qk-kitchen-dance","One-Song Kitchen Dance","Pick any song, dance around the kitchen for its full length, and see who can name the most ingredients from memory while spinning.","free","quick","in"],
  ["qk-compliment-speed-round","Compliment Speed Round","Set a two-minute timer each and take turns giving rapid-fire specific compliments until the buzzer runs out.","free","quick","in"],
  ["qk-cloud-reading","Front Yard Cloud Reading","Lie down anywhere with a view of the sky for ten minutes and take turns describing what shapes you both see passing overhead.","free","quick","out"],
  ["qk-instant-interview","Instant Replay Interview","Take turns interviewing each other for three minutes each about your best memory of the year, recorded on a phone to keep.","free","quick","in"],
  ["qk-race-the-kettle","Race the Kettle","Pick any small competitive task, like a card game or arm wrestle, and see who can win before the kettle finishes boiling.","free","quick","in"],
  ["qk-quiet-hands-walk","Quiet Hands-Held Walk","Walk once around the block in complete silence, holding hands, and only speak again once you're back at the door.","free","quick","out"],
  ["qk-guess-the-year","Guess the Year Game","Pick five songs at random from a shared playlist and see who can guess the release year closest without looking it up.","free","quick","in"],
  ["qk-future-postcard","Five-Minute Future Postcard","Each write a postcard to your future selves about today, seal them, and pick a date months away to open them together.","cheap","quick","in"],
  ["qk-doorway-dance-lesson","Doorway Dance Lesson","Pick one basic dance step you already sort of know, like a box step or a dip, teach it to each other in the hallway, and see how many times you can do it in a row without laughing.","free","quick","in"],
  ["qk-scavenger-dash","Ten-Item Scavenger Dash","Split up inside the house for five minutes to each find the item you think best represents the other person, then compare choices.","free","quick","in"],
  ["qk-elevator-pitch-day","Elevator Pitch Your Day","Give each other exactly ninety seconds to pitch how your day went like a movie trailer, dramatic voice required.","free","quick","in"],
  ["cf2-sunrise-no-turnaround-walk","No-Turnaround Sunrise Walk","Leave before the sun is fully up with no route planned and no time limit, walking until the morning feels finished, then find a cheap spot for breakfast on the way home.","cheap","allday","out"],
  ["cf2-flea-market-gift-hunt","Ten-Dollar Flea Market Gift Hunt","Give each other a strict small budget and spend a full day combing a flea market or a run of yard sales for the strangest possible gift, then swap and defend your reasoning over lunch.","cheap","allday","out"],
  ["cf2-three-neighborhoods-walk","Rate Three Unfamiliar Neighborhoods","Pick three neighborhoods you've never actually walked and spend the day wandering each one, awarding points for architecture, smells, and best bench.","free","allday","out"],
  ["cf2-sunset-bench-review-tour","Sunset Bench Review Tour","Find three different benches or ledges around town and watch part of the sunset from each one, ranking the views before the light is gone.","free","evening","out"],
  ["cf2-bookshelf-blind-swap","Bookshelf Blind Swap","Each of you picks five books the other has never read from your own shelves, wraps them in paper, then takes turns unwrapping one and reading its first page aloud.","free","evening","in"],
  ["cf2-porch-coffee-marathon","All-Morning Porch Coffee Marathon","Brew a full pot of coffee or tea from a freshly bought bag and stay outside until every cup is gone, talking through whatever comes up with phones left indoors.","cheap","allday","out"],
  ["cf2-saturday-yard-sale-crawl","Saturday Yard Sale Crawl","Map out every yard sale within walking distance and spend the morning browsing all of them on a shared five-dollar limit, comparing hauls at the end.","cheap","allday","out"],
  ["cf2-cloud-shape-photo-log","Cloud Shape Photo Log","Spend an afternoon outside snapping a photo every time a cloud looks like something specific, building a shared album and captioning each one together, then celebrate with the cheapest ice cream you can find.","cheap","evening","out"],
  ["cf2-blanket-fort-peace-talks","Blanket Fort Peace Talks","Build the most elaborate blanket fort you can from what's already in the house, then hold a mock summit inside negotiating deliberately silly household treaties.","free","evening","in"],
  ["cf2-recreate-a-parents-old-photo","Recreate a Parent's Old Photo","Dig up an old photo of your parents or grandparents as a couple and recreate the pose and outfit as closely as you can with whatever's in your closet.","free","evening","in"],
  ["cf2-full-day-phone-free-pact","Full-Day Phone-Free Pact","Lock your phones away at breakfast and don't touch them again until dinner, treating yourselves to a cheap takeout lunch as the day's one purchase.","cheap","allday","in"],
  ["cf2-invented-palm-reading-park","Invented Palm Reading in the Park","Sit on a park bench and take turns inventing wildly dramatic palm readings for each other's futures, playing it dead serious the whole time.","free","quick","out"],
  ["cf2-highest-point-picnic","Highest Point Picnic","Find the highest spot you can reach on foot within walking distance, a hill, a parking-structure roof, a lookout, and picnic there with food from your own kitchen.","cheap","evening","out"],
  ["cf2-secret-menu-kitchen-challenge","Secret Menu Kitchen Challenge","Each invent a 'secret menu' item using only what's already in the fridge, cook them blind in separate corners of the kitchen, then rate each other's dish like food critics.","free","evening","in"],
  ["cf2-anonymous-neighborhood-notes","Anonymous Neighborhood Notes","Write five short kind notes together and leave them on doorsteps or mailboxes around the block, then walk home guessing who'll find each one first.","cheap","evening","out"],
  ["cf2-fountain-wish-negotiation","Fountain Wish Negotiation","Find a public fountain and take turns tossing a coin while negotiating out loud what the other person's wish should be instead of your own.","cheap","quick","out"],
  ["cf2-seated-street-performer-critique","Seated Street Performer Critique","Sit somewhere with a view of a busy corner or plaza and quietly rate passersby's outfits and energy like judges on a panel, keeping score over a shared bag of chips.","cheap","quick","out"],
  ["cf2-recreate-a-childhood-snack","Recreate a Childhood Snack","Each recreate a snack you loved as a kid using pantry staples plus one small ingredient you go buy together, then taste-test blindfolded and guess which decade inspired which dish.","cheap","evening","in"],
  ["cf2-wordless-tea-ritual","Wordless Tea Ritual","Make tea for each other in complete silence, communicating only through gesture, and see how long you can hold the quiet before someone breaks it laughing.","free","quick","in"],
  ["cf2-same-time-parallel-walks","Same-Time Parallel Walks","Call each other and take the same walk at the same time in your own separate neighborhoods, narrating what you're each seeing until you both arrive home.","free","evening","out"],
  ["cf2-build-a-story-one-line-at-a-time","Build a Story One Line at a Time","Open a shared note from wherever you each are and write a ridiculous story one line at a time, no planning allowed, for as long as it stays funny.","free","evening","in"],
  ["cf2-long-distance-closet-fashion-show","Long-Distance Closet Fashion Show","Video call and each put together the most ridiculous outfit from your own closet in five minutes, then model them for each other like a runway show.","free","quick","in"],
  ["cf2-plant-something-on-the-same-day","Plant Something on the Same Day","Each plant a seed or cutting in a pot on the same day, wherever you live, and check in with photos as you both watch yours grow over the following weeks.","cheap","evening","in"],
  ["cf2-trade-ten-item-scavenger-lists","Trade Ten-Item Scavenger Lists","Each writes a list of ten small, odd things for the other to find somewhere within a block of home, then compare finds side by side once you're both back outside.","free","evening","out"],
  ["qk2-doorway-slow-spin","Two-Minute Doorway Slow Spin","Stop in a doorway on your way past each other, put on one song from your phone, and slow dance until it ends before going back to whatever you were doing.","free","quick","in"],
  ["qk2-fridge-magnet-poem-duel","Fridge Magnet Poem Duel","Grab whatever magnetic words are stuck to the fridge, or make some from scrap paper, and each build a tiny poem about the other in under five minutes.","free","quick","in"],
  ["qk2-ninety-second-voice-memo-vault","Ninety-Second Voice Memo Vault","Each record a ninety-second voice memo about exactly how today felt, then trade phones and listen right away, saving both for a random day next year.","free","quick","in"],
  ["qk2-corner-store-snack-dare","Corner Store Snack Dare","Walk to the nearest shop and each pick a snack the other has never tried, spending no more than a couple of dollars, then trade first-bite reactions on camera.","cheap","quick","out"],
  ["qk2-sidewalk-message-for-strangers","Sidewalk Message for Strangers","Chalk a short encouraging message on the sidewalk together for whoever walks by next, then watch from a distance to see who notices it first.","cheap","quick","out"],
  ["qk2-porch-step-color-count","Porch Step Color Count","Sit on the front step or a low wall and count how many distinct colors you can name in the sky before it fully fades, no repeats allowed.","free","quick","out"],
  ["qk2-read-me-what-you-see","Read Me What You Can See","Call each other from wherever you each are outside and read out the strangest thing written near you, signs, notices, menus, until one of you laughs first.","free","quick","out"],
  ["qk2-grocery-cart-guessing-game","Grocery Cart Guessing Game","In the nearest shop, each secretly pick five items for the other's basket without saying why, then guess each other's reasoning at checkout.","cheap","quick","out"],
  ["qk2-mirror-compliment-relay","Mirror Compliment Relay","Stand together at a mirror and take turns naming one thing you've grown to love about the other that you didn't notice years ago.","free","quick","in"],
  ["qk2-recipe-card-roulette","Recipe Card Roulette","Flip through an old cookbook or recipe box, land on a random page, and attempt to make whatever's there, buying just the one ingredient you're missing.","cheap","quick","in"],
  ["qk2-five-block-adventure-dare","Five-Block Adventure Dare","Pick a number, walk exactly that many blocks in a random direction, and turn wherever you land into a small adventure before heading back.","free","quick","out"],
  ["qk2-two-truths-and-a-taste","Two Truths and a Taste","Blindfold each other one at a time and feed three bites from the fridge, guessing which two are the same ingredient prepared differently.","free","quick","in"],
  ["qk2-three-note-gratitude-relay","Three-Note Gratitude Relay","Each write three quick notes thanking the other for something small from the past week and hide them somewhere the other will find within the hour.","free","quick","in"],
  ["qk2-sixty-second-mocktail-lab","Sixty-Second Mocktail Lab","Raid the fridge and pantry to invent a non-alcoholic drink recipe in under a minute each, then taste-test and name each other's creation.","cheap","quick","in"],
  ["qk2-highest-nearby-viewpoint-dash","Highest Nearby Viewpoint Dash","Race to find the tallest spot you can reach within a ten-minute walk, a hill, a rooftop, an overpass, and see who spots the better landmark first.","free","quick","out"],
  ["qk2-request-the-old-song","Request the Old Song","Each queue up the song that was playing during a specific memory together, play them back to back, and guess which memory sparked which pick.","free","quick","in"],
  ["qk2-invented-tarot-reading","Invented Tarot Reading","Draw random household objects, a spoon, a sock, a remote, and take turns doing a dead-serious 'tarot reading' for the other's week ahead.","free","quick","in"],
  ["qk2-bench-silence-challenge","Bench Silence Challenge","Sit together on any bench outside and see who can go longest without speaking, communicating only through expressions, before someone breaks and laughs.","free","quick","out"],
  ["qk2-non-negotiable-bucket-swap","Non-Negotiable Bucket Swap","Each name one small thing you want to do together this month that keeps getting postponed, and put a date on the calendar for it right now, no excuses.","free","quick","in"],
  ["qk2-mystery-errand-together","Mystery Errand, Together","One of you picks a mundane errand you'd normally run solo, mailing a letter, returning a library book, and turns it into a shared outing with a made-up narration of the whole trip.","cheap","quick","out"],
  ["si2-armchair-atlas-night","Armchair Atlas Night","Pick a country neither of you has visited, cook one dish from it, and invent a five-minute pretend itinerary for a trip you'll probably never take.","cheap","evening","in"],
  ["si2-couch-cinema-vote","Argue Your Way to a Movie","Each of you nominates three films with veto power over the other's list, then negotiate calmly until exactly one survives.","free","evening","in"],
  ["si2-indoor-weather-forecast","Indoor Weather Forecast","Take turns delivering a fake weather report for the living room every hour — 'scattered pillows, eighty percent chance of napping' — and act it out.","free","quick","in"],
  ["si2-decade-you-missed","The Decade You Missed","Pick a decade from before either of you was born, queue up its music, and cook something that would have been on the table then.","cheap","evening","in"],
  ["si2-no-phones-sunday","No-Phones Sunday","Put both phones in a drawer from breakfast to bedtime and fill the day with whatever you'd normally have scrolled past instead.","free","allday","in"],
  ["si2-scent-memory-lab","Scent Memory Lab","Gather five smells from around the house — coffee grounds, a candle, laundry soap — and see which memories each one pulls up for the other.","free","quick","in"],
  ["si2-home-trivia-festival","Home Trivia Festival","Write ten questions about your years together, split them into rounds, and crown a winner with a trophy made from whatever's in the recycling.","cheap","allday","in"],
  ["si2-blind-tea-flight","Blind Tea Flight","Brew four teas or herbal blends, taste them blindfolded, rank them, then reveal which was which and argue about the results.","cheap","quick","in"],
  ["si2-letter-to-future-house","Letter to the House You'll Have","Write a joint letter describing the home you picture having in ten years, seal it, and hide it somewhere you'll rediscover it later.","free","evening","in"],
  ["si2-recipe-box-lottery","Recipe Box Lottery","Write five dinners on slips of paper, draw one blind, and cook it together even when it's not what either of you wanted tonight.","cheap","evening","in"],
  ["si2-fake-radio-show","Run a Fake Radio Show","Take turns hosting and being the guest, complete with a made-up call-in segment where 'listeners' ask about your relationship.","free","quick","in"],
  ["si2-full-day-recipe-relay","Full-Day Recipe Relay","Cook breakfast, lunch, and dinner together from scratch, swapping who's chopping and who's stirring every fifteen minutes.","cheap","allday","in"],
  ["si2-indoor-camp-in","Indoor Camp-In","Turn the living room into a campsite for the night — sleeping bags on the floor, one flashlight, and ghost stories instead of a fire.","cheap","allday","in"],
  ["si2-never-asked-interview","Never-Asked Questions Interview","Take turns interviewing each other like a late-night guest, but every question has to be one you've genuinely never asked in all your years together.","free","evening","in"],
  ["si2-rearrange-by-candlelight","Rearrange a Room by Candlelight","Move one room's furniture into a completely new layout together, planning it by lamp or candlelight instead of the overhead light.","free","evening","in"],
  ["si2-window-side-picnic-day","Window-Side Picnic Day","Spend a whole day near the biggest window in the house — eat there, read there, nap there — and narrate whatever passes by outside.","free","allday","in"],
  ["si2-fortune-teller-night","Take Turns Being the Fortune Teller","Wrap a scarf around your head, light one candle, and invent outrageous, over-the-top predictions for each other's next year.","free","quick","in"],
  ["si2-mocktail-menu-night","Design a Mocktail Menu","Invent three non-alcoholic drinks with names that mean something to your relationship, then run a proper taste-test with tasting notes.","cheap","evening","in"],
  ["si2-parallel-cook-along","Cook on the Exact Same Timer","Set one shared timer and cook the same simple recipe start to finish, either side by side in the kitchen or on a video call from separate ones.","cheap","evening","in"],
  ["si2-two-screen-quiz-night","Two-Screen Quiz Night","Build a ten-question quiz about each other and take it live, side by side on the couch or over a video call.","free","quick","in"],
  ["si2-dress-as-younger-selves","Dress as Your Younger Selves","Raid the closet for the most embarrassing outfit either of you owned five years ago and wear it for the rest of the evening, no exceptions.","free","evening","in"],
  ["si2-gratitude-voicemail","Record a Gratitude Voicemail","Take turns recording a two-minute voice note about something the other did this year you never properly thanked them for, then sit and listen together.","free","quick","in"],
  ["out-bench-character-sketches","Park Bench Character Sketches","Sit on any bench and quietly invent a backstory for three strangers who pass by, then compare notes on who came up with the better story.","free","quick","out"],
  ["out-watch-the-boats","Watch the Boats Come In","Find a spot by any water — a harbour, river, canal, or pond — and sit for as long as it takes to watch a handful of boats or ducks pass by.","free","evening","out"],
  ["out-market-sample-crawl","Farmers Market Sample Crawl","Walk a local market stall to stall trying only what's free to sample, then pick one thing each to actually buy for dinner.","cheap","quick","out"],
  ["out-cloud-shape-betting","Cloud Shape Betting Round","Sit or lie on a blanket outside and place silly bets on what shape the next cloud will turn into before it drifts apart.","free","quick","out"],
  ["out-rate-every-door","Rate Every Front Door You Pass","Spend a full day wandering a few different streets and give a score out of ten to every front door, garden, or window box you pass.","free","allday","out"],
  ["out-stargazing-twist","Stargazing With a Twist Ending","Lay out a blanket after dark, name whatever constellations you half-remember, and end the night by each naming one 'star' after a private joke.","free","evening","out"],
  ["out-mystery-picnic-basket","Mystery Picnic Basket","One of you packs the picnic without telling the other what's inside, then you eat it outside wherever you end up sitting.","cheap","evening","out"],
  ["out-slowest-garden-lap","Slowest Lap of the Garden","Walk a public garden or park at half your normal pace and see who notices more small details — a bee, a bench carving, a smell.","free","quick","out"],
  ["out-fly-a-kite-badly","Fly a Kite Badly","Buy the cheapest kite you can find, take it to open ground, and give yourselves twenty minutes to get it airborne without arguing.","cheap","quick","out"],
  ["out-parallel-walk-call","Walk Different Streets, Same Call","Each go for a walk in your own neighbourhood with a video or voice call running the whole time, describing what you pass to each other.","free","quick","out"],
  ["out-trade-weather-reports","Trade Weather Reports Outside","Step outside wherever you each are at an agreed time and send a voice note describing the weather, the smell, and the noise around you.","free","quick","out"],
  ["out-bench-call-date","Bench Call Date","Find a bench or a step outside near each of you, call each other, and just sit outside together on the phone for twenty minutes with no agenda.","free","quick","out"],
  ["out-sunrise-coffee-on-a-curb","Sunrise Coffee on a Curb","Make two coffees or teas to go, find anywhere outside to sit, and watch the world wake up without talking about work or plans.","cheap","quick","out"],
  ["out-full-day-free-things","A Whole Day of Free Things","Spend a full day outside doing only things that cost nothing — a park, a viewpoint, a public garden, a long bench sit — and keep a running tally of how many you found.","free","allday","out"],
  ["out-secondhand-market-hunt","Secondhand Market Treasure Hunt","Spend the day working through secondhand stalls or charity shops with a small shared budget, hunting for the strangest useful thing you can find.","cheap","allday","out"],
  ["out-outdoor-reading-swap","Outdoor Reading Swap","Bring two books outside, read side by side for twenty minutes, then swap and read a page of each other's out loud.","free","quick","out"],
  ["out-mural-hunting-loop","Mural and Street Art Hunting Loop","Walk a route through the parts of town with the most murals, graffiti, or painted shutters and rank your top three by the end.","free","evening","out"],
  ["out-frisbee-rematch","The Rematch You Never Had","Bring any ball, frisbee, or paddle set to open ground and replay a game from your first year together, best of five.","free","quick","out"],
  ["out-fountain-coin-wishes","Fountain Coin Wishes","Find any fountain, pool, or well and each make a wish with a coin, then tell each other what you actually wished for once it's already thrown.","cheap","quick","out"],
  ["out-alphabet-neighbourhood-hunt","Alphabet Neighbourhood Hunt","Spend the day walking and pointing out something starting with each letter of the alphabet, A to Z, wherever your feet take you.","cheap","allday","out"],
  ["out-the-tree-you-both-pick","The Tree You Both Pick","Walk until you find one tree you both agree is the best one around, sit under it, and eat something simple you brought with you.","free","evening","out"],
  ["out-stretch-before-sunrise","Outdoor Stretch Before Sunrise","Bring a mat or towel outside early and move through some slow stretches together while the street is still quiet.","free","quick","out"],
  ["out-full-day-by-the-water","A Full Day by the Water","Pick any body of water you can reach and spend the day near it — walking one side, sitting on the other, eating lunch somewhere in between.","cheap","allday","out"],
  ["out-colour-scavenger-walk","Colour Scavenger Walk","Pick one colour before you leave the house and spend the walk pointing out every single thing you spot in that colour.","free","evening","out"],
  ["out-night-market-wander","Night Market Wander","Find any evening market, night stalls, or a late-opening high street and wander it slowly with no shopping list at all.","cheap","evening","out"],
  ["out-garden-hopping-day","Garden-Hopping Day","Visit two or three different public gardens, parks, or green spaces in one day and each pick your favourite bench from the whole trip.","cheap","allday","out"],
  ["top-best-bunch-bench","Best Bunch in the Shop","Buy the nicest bouquet you can find on the way home, then hand it over on a bench outside instead of at the door.","splurge","quick","out"],
  ["top-strangest-thing-budget","Strangest Thing You Can Buy","Set a matching budget, split up in one shop for ten minutes, and race to bring back the strangest item you can find for the money.","splurge","quick","out"],
  ["top-unopened-box-dare","The Unopened Box Dare","Each buy the other something small and sealed, then open them at the same moment at home with no explanation allowed until after.","splurge","quick","in"],
  ["top-good-cup-sit","The Good Cup, Sitting Down","Blow a genuinely silly amount on the best coffees and pastries you can find, then sit outside and make them last far longer than they should.","splurge","quick","out"],
  ["top-upgrade-one-thing","Upgrade One Ordinary Thing","Pick one small thing you use every evening, buy the good version of it tonight, and use it together straight away.","splurge","quick","in"],
  ["top-silly-game-now","Buy a Silly Game, Play It Now","Pick up the daftest boxed game you can find and play the first round before you have even put your coats away.","splurge","quick","in"],
  ["top-overpriced-taste-test","The Overpriced Taste Test","Buy the most absurdly overpriced snack or drink you can find while you are out, split it on the spot, and argue about whether it was worth the money.","splurge","quick","out"],
  ["top-one-question-gift","A Gift for One Question","Buy each other something that answers the question 'what do you think I need right now', then swap outside and explain your reasoning.","splurge","quick","out"],
  ["top-house-first-day","Something Neither of You Has Done","Spend the whole day attempting one thing you have both never tried, using only what is already in the house.","free","allday","in"],
  ["top-hotel-standard-night","Hotel-Standard Evening","Spend real money on the things a good hotel gets right, fresh sheets, proper towels, a breakfast worth waking up for, and stay in.","splurge","evening","in"],
  ["top-long-answer-day","One Question, All Day","Pick a question too big to answer quickly, spend a small amount on snacks for it, and keep returning to it between everything else you do.","cheap","allday","in"],
  ["top-takeaway-good-view","Good Takeaway, Better View","Spend more than usual on food to take away, then carry it somewhere outdoors with a view and eat it off your laps.","splurge","evening","out"],
  ["top-bench-hard-question","The Bench Question","Buy a cheap drink each, find a bench, and ask one question you have both been avoiding, with the rule that neither has to answer straight away.","cheap","quick","out"],
  ["top-walk-the-decade","Walk Through the Next Decade","Take a long evening walk with something warm from a shop and talk only about where you both want to be in ten years.","cheap","evening","out"],
];

export const IDEAS = RAW.map(([id, title, description, budget, time, setting]) => ({
  id, title, description, budget, time, setting,
}));

const matches = (value, wanted) => !wanted || wanted === 'any' || value === wanted;

export function filterIdeas(ideas, filters = {}) {
  const { budget, time, setting } = filters;
  return ideas.filter((i) => matches(i.budget, budget) && matches(i.time, time) && matches(i.setting, setting));
}

/**
 * Pick a random idea from `pool` that is not in `seen`. When every idea has
 * been seen, start a new round (avoiding the idea just shown when possible).
 * Returns { idea, seen, cycled }; idea is null for an empty pool.
 */
export function nextIdea(pool, seen = [], random = Math.random) {
  if (pool.length === 0) return { idea: null, seen: [], cycled: false };
  const inPool = new Set(pool.map((i) => i.id));
  const seenNow = seen.filter((id) => inPool.has(id));
  let candidates = pool.filter((i) => !seenNow.includes(i.id));
  let cycled = false;
  let base = seenNow;
  if (candidates.length === 0) {
    cycled = true;
    const last = seenNow[seenNow.length - 1];
    candidates = pool.length > 1 ? pool.filter((i) => i.id !== last) : pool;
    base = [];
  }
  const index = Math.min(candidates.length - 1, Math.floor(random() * candidates.length));
  const idea = candidates[index];
  return { idea, seen: [...base, idea.id], cycled };
}

const LABELS = { free: 'Free', cheap: 'Cheap', splurge: 'Splurge', quick: 'Under an hour', evening: 'An evening', allday: 'All day', in: 'Stay in', out: 'Go out' };

export function init(root) {
  const doc = root.ownerDocument;
  const get = (name) => root.querySelector('[data-role="' + name + '"]');
  const budget = get('budget');
  const time = get('time');
  const setting = get('setting');
  const output = get('output');
  const status = get('status');
  const list = get('list');
  const another = get('another');
  if (!budget || !time || !setting || !output || !status || !list) return;
  let seen = [];

  const pool = () => filterIdeas(IDEAS, { budget: budget.value, time: time.value, setting: setting.value });
  const meta = (i) => [i.budget, i.time, i.setting].map((k) => LABELS[k]).join(' · ');
  const clearList = () => { list.replaceChildren(); list.hidden = true; };

  function showCard(idea) {
    const h = doc.createElement('h3');
    h.textContent = idea.title;
    const p = doc.createElement('p');
    p.textContent = idea.description;
    const m = doc.createElement('p');
    m.className = 'tool-status';
    m.textContent = meta(idea);
    output.replaceChildren(h, p, m);
  }

  function pick() {
    clearList();
    const p = pool();
    if (p.length === 0) {
      output.replaceChildren();
      status.textContent = 'No ideas match all three filters. Try setting one to Any.';
      if (another) another.hidden = true;
      return;
    }
    const r = nextIdea(p, seen);
    seen = r.seen;
    showCard(r.idea);
    status.textContent = r.cycled
      ? 'You have seen all ' + p.length + ' matching ideas. Starting over.'
      : 'Idea ' + seen.length + ' of ' + p.length + ' matching.';
    if (another) another.hidden = false;
  }

  function showAll() {
    const p = pool();
    list.replaceChildren();
    if (p.length === 0) {
      status.textContent = 'No ideas match all three filters. Try setting one to Any.';
      list.hidden = true;
      return;
    }
    for (const i of p) {
      const li = doc.createElement('li');
      const b = doc.createElement('strong');
      b.textContent = i.title;
      li.append(b, ' ' + i.description + ' (' + meta(i) + ')');
      list.append(li);
    }
    list.hidden = false;
    status.textContent = p.length + ' matching ideas.';
  }

  const reset = () => {
    seen = [];
    output.replaceChildren();
    clearList();
    if (another) another.hidden = true;
    const n = pool().length;
    status.textContent = n === 0 ? 'No ideas match all three filters. Try setting one to Any.' : n + ' matching ideas.';
  };

  for (const el of [budget, time, setting]) el.addEventListener('change', reset);
  get('show').addEventListener('click', pick);
  if (another) another.addEventListener('click', pick);
  get('all').addEventListener('click', showAll);
  root.classList.add('is-ready');
  for (const el of root.querySelectorAll('[data-js-only]')) el.hidden = false;
  for (const el of root.querySelectorAll('[data-static-only]')) el.hidden = true;
  reset();
}

if (globalThis.document) {
  const start = () => {
    const el = globalThis.document.querySelector('[data-tool="date-night-ideas"]');
    if (el) init(el);
  };
  if (globalThis.document.readyState === 'loading') globalThis.document.addEventListener('DOMContentLoaded', start);
  else start();
}
