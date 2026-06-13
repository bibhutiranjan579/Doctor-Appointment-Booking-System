namespace DoctorAppointment.Application.Interfaces
{
    public interface ISentimentAnalysisService
    {
        string AnalyzeSentiment(string text);
        List<string> ExtractKeywords(string text);
        bool DetectSpam(string text, int rating);
    }
}
