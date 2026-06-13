using DoctorAppointment.Application.Interfaces;

namespace DoctorAppointment.Application.Services
{
    public class SentimentAnalysisService : ISentimentAnalysisService
    {
        private static readonly HashSet<string> PositiveWords = new(StringComparer.OrdinalIgnoreCase)
        {
            "good", "great", "excellent", "amazing", "wonderful", "fantastic", "helpful",
            "caring", "professional", "knowledgeable", "friendly", "attentive", "thorough",
            "efficient", "comfortable", "satisfied", "recommended", "best", "awesome",
            "gentle", "patient", "kind", "skilled", "expert", "compassionate", "quick",
            "clean", "organized", "punctual", "impressive", "outstanding", "brilliant"
        };

        private static readonly HashSet<string> NegativeWords = new(StringComparer.OrdinalIgnoreCase)
        {
            "bad", "terrible", "horrible", "awful", "rude", "unprofessional", "careless",
            "slow", "expensive", "disappointing", "worst", "poor", "incompetent", "waste",
            "dirty", "unclean", "negligent", "painful", "unhelpful", "disrespectful",
            "arrogant", "rushed", "ignored", "misdiagnosed", "overcharged", "late",
            "long wait", "uncomfortable", "disorganized", "unqualified", "dangerous"
        };

        private static readonly HashSet<string> SpamIndicators = new(StringComparer.OrdinalIgnoreCase)
        {
            "buy now", "click here", "free money", "act now", "limited time",
            "congratulations", "winner", "discount code", "subscribe", "follow me"
        };

        public string AnalyzeSentiment(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return "Neutral";

            var words = text.ToLower().Split(new[] { ' ', ',', '.', '!', '?', ';', ':', '\n', '\r' },
                StringSplitOptions.RemoveEmptyEntries);

            int positiveCount = 0, negativeCount = 0;

            foreach (var word in words)
            {
                if (PositiveWords.Contains(word)) positiveCount++;
                if (NegativeWords.Contains(word)) negativeCount++;
            }

            // Also check multi-word phrases
            var lowerText = text.ToLower();
            foreach (var phrase in PositiveWords.Where(w => w.Contains(' ')))
                if (lowerText.Contains(phrase)) positiveCount++;
            foreach (var phrase in NegativeWords.Where(w => w.Contains(' ')))
                if (lowerText.Contains(phrase)) negativeCount++;

            if (positiveCount > negativeCount) return "Positive";
            if (negativeCount > positiveCount) return "Negative";
            return "Neutral";
        }

        public List<string> ExtractKeywords(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return new List<string>();

            var words = text.ToLower().Split(new[] { ' ', ',', '.', '!', '?', ';', ':', '\n', '\r' },
                StringSplitOptions.RemoveEmptyEntries);

            var keywords = new List<string>();
            foreach (var word in words)
            {
                if (PositiveWords.Contains(word) || NegativeWords.Contains(word))
                    keywords.Add(word);
            }

            return keywords.Distinct().Take(10).ToList();
        }

        public bool DetectSpam(string text, int rating)
        {
            if (string.IsNullOrWhiteSpace(text)) return false;

            var lowerText = text.ToLower();

            // Check for spam indicators
            foreach (var indicator in SpamIndicators)
            {
                if (lowerText.Contains(indicator)) return true;
            }

            // Check for excessive repetition
            var words = lowerText.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (words.Length > 5)
            {
                var uniqueRatio = (double)words.Distinct().Count() / words.Length;
                if (uniqueRatio < 0.3) return true;
            }

            // Check for excessive caps (>70% uppercase in original)
            if (text.Length > 10)
            {
                var capsRatio = (double)text.Count(char.IsUpper) / text.Length;
                if (capsRatio > 0.7) return true;
            }

            // Very short review with extreme rating
            if (text.Length < 5 && (rating == 1 || rating == 5)) return true;

            return false;
        }
    }
}
