const fs = require('fs');

const input = fs.readFileSync('./input.txt', 'utf-8');

const [ rulesEncoded, myTicketEncoded, nearbyEncoded ] = input.split("\n\n");

const rules = rulesEncoded.split("\n")
    .map((encoded) => {
        const [ name, rangesEncoded ] = encoded.split(": ");
        const ranges = rangesEncoded.split(" or ")
            .map((rangesEncoded) => {
                const [ min, max ] = rangesEncoded.split("-");

                return {
                    min: 1 * min,
                    max: 1 * max,
                };
            });

        return {
            name,
            ranges,
        };
    });

const nearbyTickets = nearbyEncoded.split("\n")
    .slice(1)
    .map((nearbyTicketEncoded) => {
        return nearbyTicketEncoded
            .split(",")
            .map((value) => 1 * value);
    });

const invalidTickets = nearbyTickets
    .map((ticket) => {
        const result = {
            valid: true,
            invalidValues: [],
        };

        result.invalidValues = ticket.filter((value) => {
            const validRules = rules.filter((rule) => {
                const validRanges = rule.ranges.filter((range) => {
                    return range.min <= value && value <= range.max;
                });

                return validRanges.length;
            });

            return !validRules.length;
        });

        result.valid = !result.invalidValues.length;

        return result;
    })
    .filter((ticket) => {
        return !ticket.valid;
    });

const errorRate = invalidTickets.reduce((sum, invalidTicket) => {
    return sum + invalidTicket.invalidValues.reduce((ticketSum, invalidValue) => {
        return ticketSum + invalidValue;
    }, 0);
}, 0);

console.log(errorRate);