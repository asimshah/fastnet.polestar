using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace Fastnet.Core.Web
{
    public class WebApiClient : HttpClient
    {
        public WebApiClient(string siteAddress)
        {
            this.BaseAddress = new Uri(siteAddress);
        }
        public async Task<TReturn> PostAsync<TSend, TReturn>(string request, TSend data)
        {
            try
            {
                //var response = await this.PostAsJsonAsync<TSend>(request, data);
                // **NB** Beware: the PostAsJsonAsync does exit but I could not get it to work
                string content = Newtonsoft.Json.JsonConvert.SerializeObject(data);
                var response = await this.PostAsync(request, new StringContent(content, Encoding.UTF8, "application/json"));

                return await processResponse<TReturn>(response);
            }
            catch (HttpRequestException hre)
            {
                await handleHttpRequestException(hre);
                throw new Exception($"Request to {request} failed: {hre.Message}");
            }
            catch (Exception xe)
            {
                throw new Exception($"Request to {request} failed: {xe.Message}");
            }
        }

        private async Task<T> processResponse<T>(HttpResponseMessage response)
        {
            if (response.IsSuccessStatusCode)
            {
                return await response.Content.ReadAsAsync<T>();
            }
            else
            {
                string reason = response.ReasonPhrase;
                string request = response.RequestMessage.RequestUri.ToString();
                throw new Exception($"Request to {request} failed: {reason}");
            }
        }

        public async Task<T> GetAsync<T>(string request)
        {
            try
            {
                var response = await GetAsync(request);
                return await processResponse<T>(response);
            }
            catch (HttpRequestException hre)
            {
                await handleHttpRequestException(hre);
                throw new Exception($"Request to {request} failed: {hre.Message}");
            }
            catch (Exception xe)
            {
                throw new Exception($"Request to {request} failed: {xe.Message}");
            }
        }

        private async Task handleHttpRequestException(HttpRequestException hre)
        {
            if (hre.InnerException is WebException)
            {
                WebException we = (WebException)hre.InnerException;
                var message = await new StreamReader(we.Response.GetResponseStream()).ReadToEndAsync();
                throw new ApplicationException($"{we.Status.ToString()}: {message}", we);
            }
        }
    }
}
